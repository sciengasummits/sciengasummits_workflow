const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://scienga:scienga@ac-blmkilg-shard-00-00.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-01.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-02.dphtrai.mongodb.net:27017/?ssl=true&replicaSet=atlas-6k8qyx-shard-0&authSource=admin&appName=SciEng';

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
