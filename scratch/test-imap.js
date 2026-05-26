const { ImapFlow } = require('imapflow');

const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
        user: 'wscsnsummit@sciengasummits.com',
        pass: 'pjvmdggswdvvgkcz'
    },
    logger: {
        debug: console.log,
        info: console.log,
        warn: console.warn,
        error: console.error
    }
});

async function main() {
    try {
        console.log("Connecting to imap.gmail.com...");
        await client.connect();
        console.log("Connected successfully!");
        
        const list = await client.list();
        console.log("Available folders:", list.map(f => f.path));
        
        await client.logout();
    } catch (err) {
        console.error("IMAP Connection Error:", err);
    }
}

main();
