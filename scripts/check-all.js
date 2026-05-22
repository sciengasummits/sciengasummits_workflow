import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set');
    process.exit(1);
}

const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key:        { type: String, required: true },
    data:       { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt:  { type: Date, default: Date.now },
});
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

async function check() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const conferences = await SiteContent.distinct('conference');
    console.log('Found conferences:', conferences);

    for (const conf of conferences) {
        console.log(`\n=================== Conference: ${conf} ===================`);
        const items = await SiteContent.find({ conference: conf });
        for (const item of items) {
            console.log(`Key: "${item.key}" | Data fields:`, Object.keys(item.data || {}));
        }
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
