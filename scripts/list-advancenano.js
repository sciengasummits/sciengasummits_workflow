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
SiteContentSchema.index({ conference: 1, key: 1 }, { unique: true });
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

async function check() {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const items = await SiteContent.find({ conference: 'advancenano' });
    console.log(`Found ${items.length} items for conference: 'advancenano'\n`);
    for (const item of items) {
        console.log(`Key: "${item.key}" (Type: ${typeof item.key})`);
        console.log(`Data keys:`, Object.keys(item.data || {}));
        if (item.key === 'hero') {
            console.log(`Hero Details:`, JSON.stringify(item.data, null, 2));
        }
        console.log('--------------------------------------------------');
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
}

check().catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
});
