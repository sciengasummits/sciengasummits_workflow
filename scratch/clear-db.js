const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://LIUTEXVORTEXSUMMIT2026:LIUTEX@ac-oydsouh-shard-00-00.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-01.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-02.sozesho.mongodb.net:27017/?ssl=true&replicaSet=atlas-w8th4c-shard-0&authSource=admin&retryWrites=true&w=majority&appName=LIUTEXVORTEXSUMMIT2026';

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

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected!");
        
        console.log("Purging all mailbox cache for wscsn2027...");
        const result = await WorkflowEmail.deleteMany({ conference: 'wscsn2027' });
        console.log(`Deleted ${result.deletedCount} emails.`);
        
        await mongoose.disconnect();
        console.log("Done!");
    } catch (err) {
        console.error(err);
    }
}

main();
