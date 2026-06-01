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

        const count = await WorkflowEmail.countDocuments({ conference: 'wscsn2027' });
        console.log(`Total emails in DB for wscsn2027: ${count}`);

        const mocks = await WorkflowEmail.countDocuments({ conference: 'wscsn2027', uid: { $exists: false } });
        console.log(`Mock/placeholder emails: ${mocks}`);

        const real = await WorkflowEmail.countDocuments({ conference: 'wscsn2027', uid: { $exists: true } });
        console.log(`Real Gmail synced emails: ${real}`);

        const sample = await WorkflowEmail.find({ conference: 'wscsn2027' }).limit(3).lean();
        console.log("Samples:", sample.map(s => ({ folder: s.folder, subject: s.subject, uid: s.uid })));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

main();
