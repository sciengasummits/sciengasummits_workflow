/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration — Add missing `partners_logos` key to all conferences
 * Run with : node --experimental-vm-modules scripts/migrate-add-partners-logos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe to run multiple times — skips conferences that already have the key.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set.');
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

const DEFAULT_DATA = {
    title: 'Promoting & Media Partners',
    items: [],
};

async function migrate() {
    console.log('\n🔗  Connecting to MongoDB…');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected\n');

    // Find all distinct conference IDs that have any SiteContent
    const conferences = await SiteContent.distinct('conference');
    console.log(`📋  Found ${conferences.length} conference(s): ${conferences.join(', ')}\n`);

    let created = 0;
    let skipped = 0;

    for (const conf of conferences) {
        const existing = await SiteContent.findOne({ conference: conf, key: 'partners_logos' });
        if (existing) {
            console.log(`  ⏩  SKIPPED  [${conf}] — partners_logos already exists`);
            skipped++;
        } else {
            await SiteContent.create({ conference: conf, key: 'partners_logos', data: DEFAULT_DATA });
            console.log(`  ✅  CREATED  [${conf}] — partners_logos`);
            created++;
        }
    }

    console.log(`\n─────────────────────────────`);
    console.log(`  Created : ${created}`);
    console.log(`  Skipped : ${skipped}`);
    console.log(`  Total   : ${conferences.length}`);
    console.log(`─────────────────────────────\n`);

    await mongoose.disconnect();
    console.log('🔌  Disconnected. Done!\n');
}

migrate().catch(err => {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
});
