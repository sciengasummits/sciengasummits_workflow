import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkflowEmail from '@/models/WorkflowEmail';
import { requireAuth } from '@/lib/auth';
import { RealEmailSender } from '@/lib/emailSender';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

// Helper to strip HTML tags for text representation
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Perform IMAP sync from Gmail
async function syncImapEmails(conference, account) {
    if (!account || !account.user || !account.pass || account.pass.startsWith('REPLACE_WITH') || !account.pass.trim()) {
        console.log(`[IMAP] No valid credentials for ${conference}, skipping live IMAP sync.`);
        return false;
    }

    console.log(`[IMAP] Connecting to imap.gmail.com for ${conference} (${account.user})...`);
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: account.user,
            pass: account.pass
        },
        logger: false
    });

    try {
        await client.connect();
        
        // Sync Inbox
        await syncFolder(client, conference, 'INBOX', 'inbox');
        
        // Sync Sent Mail
        try {
            await syncFolder(client, conference, '[Gmail]/Sent Mail', 'sent');
        } catch (_) {
            try {
                await syncFolder(client, conference, 'Sent', 'sent');
            } catch (_) {}
        }

        // Sync Drafts
        try {
            await syncFolder(client, conference, '[Gmail]/Drafts', 'drafts');
        } catch (_) {
            try {
                await syncFolder(client, conference, 'Drafts', 'drafts');
            } catch (_) {}
        }

        // Sync Bin/Trash (Try both [Gmail]/Bin and [Gmail]/Trash)
        try {
            await syncFolder(client, conference, '[Gmail]/Bin', 'bin');
        } catch (_) {
            try {
                await syncFolder(client, conference, '[Gmail]/Trash', 'bin');
            } catch (_) {
                try {
                    await syncFolder(client, conference, 'Trash', 'bin');
                } catch (_) {}
            }
        }

        console.log(`[IMAP] Sync successfully completed for ${conference}`);
        return true;
    } catch (error) {
        console.error(`[IMAP] Sync failed for ${conference}:`, error.message);
        throw error;
    } finally {
        try {
            await client.logout();
        } catch (_) {}
    }
}

async function syncFolder(client, conference, imapFolderName, dbFolderName) {
    let lock = await client.getMailboxLock(imapFolderName);
    try {
        const count = client.mailbox.exists;
        if (count === 0) {
            // If Gmail folder is empty, clear local DB folder cache
            await WorkflowEmail.deleteMany({ conference, folder: dbFolderName });
            return;
        }

        // Fetch last 100 messages from Gmail for perfect sync
        const startRange = Math.max(1, count - 99);
        const query = `${startRange}:*`;
        const messages = await client.fetch(query, {
            uid: true,
            envelope: true,
            flags: true,
            source: true
        });

        const activeUids = [];

        for await (let message of messages) {
            if (!message.uid) continue;
            activeUids.push(message.uid);

            // Parse mail headers and body
            const parsed = await simpleParser(message.source);
            const from = parsed.from ? parsed.from.text : (message.envelope.from ? message.envelope.from.map(f => `${f.name || ''} <${f.address}>`).join(', ') : 'Unknown');
            const to = parsed.to ? parsed.to.text : (message.envelope.to ? message.envelope.to.map(t => `${t.name || ''} <${t.address}>`).join(', ') : 'Unknown');
            const subject = parsed.subject || message.envelope.subject || '(No Subject)';
            const body = parsed.html || parsed.textAsHtml || parsed.text || '';
            const date = parsed.date || message.envelope.date || new Date();

            const isImportant = message.flags && (message.flags.has?.('\\Flagged') || message.flags.includes?.('\\Flagged') || false);
            const isRead = message.flags && (message.flags.has?.('\\Seen') || message.flags.includes?.('\\Seen') || true);

            // Upsert to completely prevent duplicates and keep star/unread states perfectly identical
            await WorkflowEmail.findOneAndUpdate(
                { conference, folder: dbFolderName, uid: message.uid },
                { from, to, subject, body, isRead, isImportant, createdAt: date },
                { upsert: true, new: true }
            );
        }

        // Delete any local emails for this folder that are no longer present in Gmail
        await WorkflowEmail.deleteMany({
            conference,
            folder: dbFolderName,
            uid: { $nin: activeUids, $exists: true }
        });
    } catch (err) {
        console.warn(`[IMAP] Folder sync skipped/failed for ${imapFolderName}:`, err.message);
    } finally {
        lock.release();
    }
}

// Generate beautiful fallback mock emails if DB is empty or IMAP fails
async function seedMockEmails(conference) {
    const existingCount = await WorkflowEmail.countDocuments({ conference });
    if (existingCount > 0) return;

    console.log(`[SEED] Seeding highly realistic fallback emails for ${conference}`);
    const mockTemplates = [
        {
            folder: 'inbox',
            from: 'Conference Management System <system@sciengasummits.com>',
            to: `${conference}@sciengasummits.com`,
            subject: `Your Login OTP - Conference Management System`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #1e3a8a; margin-top: 0;">Verification Code Required</h2>
                    <p>A login request was made for your account on the <strong>Conference Management System</strong>.</p>
                    <p>Please use the following One-Time Password (OTP) to log in:</p>
                    <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #1e3a8a; border-radius: 6px; margin: 20px 0;">
                        1234
                    </div>
                    <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
                </div>
            `,
            isRead: false,
            isImportant: true,
            createdAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
            folder: 'inbox',
            from: 'Dr. Patrick N. Palli <palli.patrick@oxford.edu>',
            to: `${conference}@sciengasummits.com`,
            subject: `Program Schedule Requested - ${conference.toUpperCase()} 2027`,
            body: `
                <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <h2 style="color: #1e3a8a; margin-top:0;">New Program Schedule Request</h2>
                        <p>A user has requested to be notified when the program schedule is released.</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">Dr. Patrick N. Palli</td></tr>
                            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">palli.patrick@oxford.edu</td></tr>
                            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Contact Number:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">+44 7911 123456</td></tr>
                            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Conference:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${conference.toUpperCase()}</td></tr>
                        </table>
                    </div>
                </div>
            `,
            isRead: true,
            isImportant: false,
            createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
        },
        {
            folder: 'inbox',
            from: 'Albin D. <albin@sciengasummits.com>',
            to: `attendees@sciengasummits.com`,
            subject: `Welcome to World Summit in London UK June 10-12, 2027`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dbeafe; border-radius: 8px; background: #f8faff;">
                    <h2 style="color: #2563eb; margin-top: 0;">Welcome to the World Summit!</h2>
                    <p>Dear Delegate,</p>
                    <p>We are delighted to welcome you to the upcoming World Summit, taking place in London, UK from June 10-12, 2027.</p>
                    <p>Your registration is complete. We will share the full scientific schedule and venue logistics details shortly.</p>
                    <br />
                    <p>Best regards,<br/>Organizing Committee Summit 2027</p>
                </div>
            `,
            isRead: true,
            isImportant: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            folder: 'inbox',
            from: 'Sai Krishna <sai@gmail.com>',
            to: `${conference}@sciengasummits.com`,
            subject: `New Abstract Submitted: sai — ${conference.toUpperCase()}`,
            body: `
                <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #16a34a; margin-top:0;">Abstract Submission Received</h2>
                        <p>An abstract has been submitted for review for the ${conference.toUpperCase()} summit.</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Author:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">Sai Krishna</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Title:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">Advanced Nanotechnology Applications in Energy Storage</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:sai@gmail.com" style="color: #2563eb;">sai@gmail.com</a></td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Country:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">India</td></tr>
                        </table>
                    </div>
                </div>
            `,
            isRead: true,
            isImportant: false,
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        },
        {
            folder: 'drafts',
            from: `${conference}@sciengasummits.com`,
            to: 'keynote@sciencesummits.com',
            subject: 'Invitation to deliver Keynote Address at World Summit 2027',
            body: `
                <div style="font-family: Arial, sans-serif; padding: 10px;">
                    <p>Dear Professor,</p>
                    <p>On behalf of the Organizing Committee, we are pleased to invite you to deliver a Keynote Lecture at the World Summit in London...</p>
                    <p>Kindly verify if your calendar allows you to join us.</p>
                </div>
            `,
            isRead: true,
            isImportant: false,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
    ];

    for (const t of mockTemplates) {
        await WorkflowEmail.create({
            conference,
            ...t
        });
    }
}

// ── GET REQUEST: FETCH EMAILS WITH IMAP SYNC FALLBACK ───────────────────
export async function GET(request) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const conference = auth.user.conferenceId || 'liutex';

    try {
        await dbConnect();
        
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder') || 'inbox'; // inbox, sent, drafts, bin, starred, all
        const refresh = searchParams.get('refresh') === 'true';

        const sender = new RealEmailSender();
        const account = sender._accounts[conference.toLowerCase()];

        // Check if database only has mock emails (no UID)
        const mockCount = await WorkflowEmail.countDocuments({ conference, uid: { $exists: false } });
        const realCount = await WorkflowEmail.countDocuments({ conference, uid: { $exists: true } });
        
        // Auto-sync if explicitly requested OR if we only have mocks and credentials are ready
        const hasValidCreds = account && account.user && account.pass && !account.pass.startsWith('REPLACE_WITH') && account.pass.trim().length > 0;
        const shouldSync = refresh || (realCount === 0 && hasValidCreds);

        if (shouldSync) {
            try {
                console.log(`[ROUTE] Triggering Gmail IMAP sync for ${conference}...`);
                const ok = await syncImapEmails(conference, account);
                
                // If IMAP sync successfully retrieved real emails, clear the seeded mock emails
                if (ok) {
                    await WorkflowEmail.deleteMany({ conference, uid: { $exists: false } });
                } else {
                    await seedMockEmails(conference);
                }
            } catch (err) {
                console.error('[ROUTE] IMAP Sync failed, seeding mocks as backup:', err.message);
                await seedMockEmails(conference);
            }
        }

        // Fetch emails from MongoDB
        const query = { conference };
        if (folder === 'starred') {
            query.isImportant = true;
            query.folder = { $ne: 'bin' }; // Do not show starred items that are deleted
        } else if (folder === 'all') {
            query.folder = { $ne: 'bin' }; // All mail except trash
        } else {
            query.folder = folder;
        }

        const emails = await WorkflowEmail.find(query)
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        // Fetch badge counts dynamically
        const inboxUnread = await WorkflowEmail.countDocuments({ conference, folder: 'inbox', isRead: false });
        const draftsCount = await WorkflowEmail.countDocuments({ conference, folder: 'drafts' });
        const starredCount = await WorkflowEmail.countDocuments({ conference, isImportant: true, folder: { $ne: 'bin' } });

        return NextResponse.json({ 
            success: true, 
            emails,
            counts: {
                inbox: inboxUnread,
                drafts: draftsCount,
                starred: starredCount
            }
        });
    } catch (err) {
        console.error('Mail Fetch API error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// ── POST REQUEST: COMPOSE (SEND, SAVE DRAFT), STAR, DELETE, MARK READ ──
export async function POST(request) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const conference = auth.user.conferenceId || 'liutex';

    try {
        await dbConnect();
        const body = await request.json();
        const { action } = body;

        const sender = new RealEmailSender();
        const account = sender._accounts[conference.toLowerCase()];
        const fromUser = account?.user || sender.user;

        if (action === 'send') {
            const { to, subject, emailBody } = body;
            if (!to) {
                return NextResponse.json({ success: false, error: 'Recipient email is required.' }, { status: 400 });
            }

            // Get SMTP transporter configured in system
            const transporter = sender._transporters[conference.toLowerCase()] || sender._defaultTransporter;
            const displayName = account?.displayName || conference.toUpperCase();

            console.log(`[SMTP] Composing & sending email → from: ${fromUser} to: ${to}`);

            const mailInfo = await transporter.sendMail({
                from: `"${displayName}" <${fromUser}>`,
                to,
                subject: subject || '(No Subject)',
                html: emailBody || '',
                text: stripHtml(emailBody)
            });

            // Save sent email into Sent folder in MongoDB
            const sentEmail = await WorkflowEmail.create({
                conference,
                folder: 'sent',
                from: fromUser,
                to,
                subject: subject || '(No Subject)',
                body: emailBody || '',
                isRead: true,
                createdAt: new Date()
            });

            // If this was originally a draft, delete the draft
            if (body.draftId) {
                await WorkflowEmail.deleteOne({ _id: body.draftId, conference, folder: 'drafts' });
            }

            return NextResponse.json({ success: true, message: 'Email sent successfully!', email: sentEmail });
        }

        if (action === 'draft') {
            const { draftId, to, subject, emailBody } = body;
            let draft;

            if (draftId) {
                // Update existing draft
                draft = await WorkflowEmail.findOneAndUpdate(
                    { _id: draftId, conference, folder: 'drafts' },
                    { to: to || '', subject: subject || '', body: emailBody || '', createdAt: new Date() },
                    { new: true }
                );
            }

            if (!draft) {
                // Create new draft
                draft = await WorkflowEmail.create({
                    conference,
                    folder: 'drafts',
                    from: fromUser,
                    to: to || '',
                    subject: subject || '',
                    body: emailBody || '',
                    isRead: true,
                    createdAt: new Date()
                });
            }

            return NextResponse.json({ success: true, draftId: draft._id, email: draft });
        }

        if (action === 'delete') {
            const { emailIds } = body;
            if (!Array.isArray(emailIds) || emailIds.length === 0) {
                return NextResponse.json({ success: false, error: 'emailIds array is required.' }, { status: 400 });
            }

            const targetEmails = await WorkflowEmail.find({ _id: { $in: emailIds }, conference });
            
            // Emails already in the bin are permanently deleted
            const permanentIds = targetEmails.filter(e => e.folder === 'bin').map(e => e._id);
            const trashIds = targetEmails.filter(e => e.folder !== 'bin').map(e => e._id);

            if (permanentIds.length > 0) {
                await WorkflowEmail.deleteMany({ _id: { $in: permanentIds } });
            }
            if (trashIds.length > 0) {
                await WorkflowEmail.updateMany(
                    { _id: { $in: trashIds } },
                    { folder: 'bin' }
                );
            }

            return NextResponse.json({ success: true, message: 'Emails deleted successfully.' });
        }

        if (action === 'star') {
            const { emailId, isImportant } = body;
            if (!emailId) {
                return NextResponse.json({ success: false, error: 'emailId is required.' }, { status: 400 });
            }

            const updated = await WorkflowEmail.findOneAndUpdate(
                { _id: emailId, conference },
                { isImportant },
                { new: true }
            );

            return NextResponse.json({ success: true, email: updated });
        }

        if (action === 'read') {
            const { emailIds, isRead } = body;
            if (!Array.isArray(emailIds) || emailIds.length === 0) {
                return NextResponse.json({ success: false, error: 'emailIds array is required.' }, { status: 400 });
            }

            await WorkflowEmail.updateMany(
                { _id: { $in: emailIds }, conference },
                { isRead }
            );

            return NextResponse.json({ success: true, message: 'Emails marked successfully.' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
    } catch (err) {
        console.error('Mail Actions API error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
