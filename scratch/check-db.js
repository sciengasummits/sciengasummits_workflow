require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key:        { type: String, required: true },
    data:       { type: mongoose.Schema.Types.Mixed, required: true },
});
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

async function check() {
    console.log('Connecting to:', MONGODB_URI ? MONGODB_URI.substring(0, 50) + '...' : 'undefined');
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is undefined!');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const conferences = await SiteContent.distinct('conference');
    console.log('Conferences found in DB:', conferences);

    for (const conf of conferences) {
        const counts = await SiteContent.countDocuments({ conference: conf });
        console.log(`Conference: "${conf}" has ${counts} documents.`);
    }

    console.log('Querying keys for "civilenv"...');
    const civilenvDocs = await SiteContent.find({ conference: 'civilenv' });
    console.log(`Found ${civilenvDocs.length} keys for civilenv:`);
    civilenvDocs.forEach(d => console.log(` - ${d.key}`));

    console.log('Querying keys for "civilenv:1"...');
    const civilenv1Docs = await SiteContent.find({ conference: 'civilenv:1' });
    console.log(`Found ${civilenv1Docs.length} keys for civilenv:1:`);
    civilenv1Docs.forEach(d => console.log(` - ${d.key}`));

    await mongoose.disconnect();
    console.log('Done.');
}

check().catch(console.error);
