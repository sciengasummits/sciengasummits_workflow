import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';
import { requireAuth } from '@/lib/auth';
import { RealEmailSender } from '@/lib/emailSender';

const realEmailSender = new RealEmailSender();

// GET — Admin reads all abstracts (requires auth)
export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const abstracts = await Abstract.find({ conference: conf }).sort({ createdAt: -1 });
        return NextResponse.json(abstracts);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — Public abstract submission (no auth required - this is from the website)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        // Robust Sanitization
        const safeStr = (val) => (val && String(val) !== 'undefined') ? String(val).trim() : '';
        
        const sanitized = {
            conference: safeStr(body.conference) || 'liutex',
            name: safeStr(body.name) || 'Unknown',
            email: safeStr(body.email) || '',
            phone: safeStr(body.phone) || '',
            affiliation: safeStr(body.affiliation) || safeStr(body.organization) || '—',
            organization: safeStr(body.organization) || safeStr(body.affiliation) || '—',
            country: safeStr(body.country) || '—',
            address: safeStr(body.address) || '—',
            topic: safeStr(body.topic) || '—',
            title: safeStr(body.title) || 'Untitled',
            abstractText: safeStr(body.abstractText) || '',
            fileUrl: safeStr(body.fileUrl) || '',
            fileName: safeStr(body.fileName) || '',
            category: safeStr(body.category) || safeStr(body.interest) || '—',
            interest: safeStr(body.interest) || safeStr(body.category) || '—',
        };

        const abs = new Abstract(sanitized);
        await abs.save();

        const conferenceId = sanitized.conference;

        // Notify admin via email (full details)
        try {
            await realEmailSender.sendAbstractToAdmin(sanitized, conferenceId);
        } catch (emailErr) {
            console.error('[AbstractSubmission] Failed to send admin email:', emailErr);
        }

        // Send confirmation email to user
        try {
            await realEmailSender.sendAbstractConfirmationToUser(sanitized, conferenceId);
        } catch (emailErr) {
            console.error('[AbstractSubmission] Failed to send user confirmation email:', emailErr);
        }

        return NextResponse.json(abs, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
