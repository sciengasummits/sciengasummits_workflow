const mongoose = require('mongoose');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from workflow's .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://LIUTEXVORTEXSUMMIT2026:LIUTEX@ac-oydsouh-shard-00-00.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-01.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-02.sozesho.mongodb.net:27017/?ssl=true&replicaSet=atlas-w8th4c-shard-0&authSource=admin&retryWrites=true&w=majority&appName=LIUTEXVORTEXSUMMIT2026';

const WorkflowEmailSchema = new mongoose.Schema({
    conference: String,
    folder: String,
    uid: Number,
    from: String,
    to: String,
    subject: String,
    body: String,
    isRead: Boolean,
    isImportant: Boolean,
    createdAt: Date
});

const WorkflowEmail = mongoose.models.WorkflowEmail || mongoose.model('WorkflowEmail', WorkflowEmailSchema);

async function syncFolder(client, conference, imapFolderName, dbFolderName) {
    let lock = await client.getMailboxLock(imapFolderName);
    try {
        const count = client.mailbox.exists;
        console.log(`[IMAP] Folder ${imapFolderName} has ${count} messages.`);
        if (count === 0) {
            await WorkflowEmail.deleteMany({ conference, folder: dbFolderName });
            return;
        }

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

            const parsed = await simpleParser(message.source);
            const from = parsed.from ? parsed.from.text : (message.envelope.from ? message.envelope.from.map(f => `${f.name || ''} <${f.address}>`).join(', ') : 'Unknown');
            const to = parsed.to ? parsed.to.text : (message.envelope.to ? message.envelope.to.map(t => `${t.name || ''} <${t.address}>`).join(', ') : 'Unknown');
            const subject = parsed.subject || message.envelope.subject || '(No Subject)';
            const body = parsed.html || parsed.textAsHtml || parsed.text || '';
            const date = parsed.date || message.envelope.date || new Date();

            const isImportant = message.flags && (message.flags.has?.('\\Flagged') || message.flags.includes?.('\\Flagged') || false);
            const isRead = message.flags && (message.flags.has?.('\\Seen') || message.flags.includes?.('\\Seen') || true);

            await WorkflowEmail.findOneAndUpdate(
                { conference, folder: dbFolderName, uid: message.uid },
                { from, to, subject, body, isRead, isImportant, createdAt: date },
                { upsert: true, new: true }
            );
        }

        const deleteResult = await WorkflowEmail.deleteMany({
            conference,
            folder: dbFolderName,
            uid: { $nin: activeUids, $exists: true }
        });
        console.log(`[IMAP] Synced folder ${dbFolderName}. Pruned ${deleteResult.deletedCount} stale emails.`);

    } catch (err) {
        console.warn(`[IMAP] Folder sync failed for ${imapFolderName}:`, err.message);
    } finally {
        lock.release();
    }
}

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB!");

        const user = process.env.WSCSN_SMTP_USER || 'wscsnsummit@sciengasummits.com';
        const passRaw = process.env.WSCSN_SMTP_PASS || '';
        const pass = passRaw.replace(/\s/g, '');

        if (!pass) {
            console.error("No password configured!");
            return;
        }

        console.log(`Connecting to Gmail IMAP for ${user}...`);
        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: { user, pass },
            logger: false
        });

        await client.connect();
        console.log("Connected to Gmail IMAP! Starting synchronization...");

        // Sync folders
        await syncFolder(client, 'wscsn2027', 'INBOX', 'inbox');
        
        try {
            await syncFolder(client, 'wscsn2027', '[Gmail]/Sent Mail', 'sent');
        } catch (_) {
            try {
                await syncFolder(client, 'wscsn2027', 'Sent', 'sent');
            } catch (_) {}
        }

        try {
            await syncFolder(client, 'wscsn2027', '[Gmail]/Drafts', 'drafts');
        } catch (_) {
            try {
                await syncFolder(client, 'wscsn2027', 'Drafts', 'drafts');
            } catch (_) {}
        }

        try {
            await syncFolder(client, 'wscsn2027', '[Gmail]/Bin', 'bin');
        } catch (_) {
            try {
                await syncFolder(client, 'wscsn2027', '[Gmail]/Trash', 'bin');
            } catch (_) {
                try {
                    await syncFolder(client, 'wscsn2027', 'Trash', 'bin');
                } catch (_) {}
            }
        }

        await client.logout();
        console.log("IMAP logout complete.");
        await mongoose.disconnect();
        console.log("DB disconnect complete. All data successfully synchronized!");

    } catch (err) {
        console.error("Sync Error:", err);
    }
}

main();
