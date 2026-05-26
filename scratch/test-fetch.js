const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
        user: 'wscsnsummit@sciengasummits.com',
        pass: 'pjvmdggswdvvgkcz'
    },
    logger: false
});

async function main() {
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected! Selecting INBOX...");
        
        let lock = await client.getMailboxLock('INBOX');
        try {
            console.log("Mailbox INBOX locked. Fetching status...");
            const mailbox = client.mailbox;
            console.log("Mailbox status:", mailbox);
            
            console.log("Fetching emails 1:*...");
            const messages = await client.fetch('1:*', {
                uid: true,
                envelope: true,
                flags: true,
                source: true
            });
            
            let count = 0;
            for await (let message of messages) {
                count++;
                const parsed = await simpleParser(message.source);
                console.log(`Email #${count} [UID: ${message.uid}]:`);
                console.log(`  Subject: ${parsed.subject || '(No Subject)'}`);
                console.log(`  From: ${parsed.from ? parsed.from.text : 'Unknown'}`);
                console.log(`  Date: ${parsed.date}`);
                if (count >= 5) {
                    console.log("Showing first 5 emails...");
                    break;
                }
            }
            if (count === 0) {
                console.log("No emails returned by fetch.");
            }
        } finally {
            lock.release();
        }
        
        await client.logout();
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

main();
