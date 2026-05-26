/**
 * clean-polluted.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cleans up data-pollution in the advancenano and opticphoton conferences:
 *   1. Deletes any document whose `key` is `"null"` or null.
 *   2. For the sections that got cross-contaminated (hero, about, stats,
 *      pricing, marquee, brochure, partners_logos), it replaces the `data`
 *      subdocument with ONLY the fields that legally belong to that section.
 *
 * Usage:
 *   node scripts/clean-polluted.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set in .env');
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

// ── Allowed field definitions per section key ──────────────────────────────

const ALLOWED_FIELDS = {
    hero: [
        'subtitle', 'title', 'description', 'conferenceDate', 'venue',
        'countdownTarget', 'showRegister', 'showAbstract', 'showBrochure',
        'showAnnouncement', 'announcementUrl', 'brochureUrl',
        'abstractTemplateUrl', 'bgImage',
        // Extra fields set by ImportantDates.js (partial save to hero key)
        'shortName', 'completeUrl', 'fullName', 'subject', 'theme',
    ],
    about: [
        'subtitle', 'title', 'paragraph1', 'paragraph2',
        'objectives', 'keyThemes',
        // About rich-text editor also saves html field
        'html',
    ],
    stats: ['title', 'items'],
    pricing: ['title', 'packages'],
    marquee: ['title', 'items'],
    brochure: [
        'title', 'description', 'note', 'features', 'pdfUrl',
        'digitalTitle', 'overview', 'objectives', 'audience', 'themes',
    ],
    partners_logos: ['title', 'items'],
};

// ── Pick only the allowed keys from an object ──────────────────────────────

function pickAllowed(data, allowed) {
    const cleaned = {};
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            cleaned[key] = data[key];
        }
    }
    return cleaned;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function clean() {
    console.log('🔌  Connecting to MongoDB…');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected.\n');

    const CONFERENCES_TO_CLEAN = ['advancenano', 'opticphoton'];

    for (const conf of CONFERENCES_TO_CLEAN) {
        console.log(`\n═══════════════  Conference: ${conf}  ═══════════════`);

        // ── Step 1: Delete documents with null/string-null keys ─────────────
        const nullDel = await SiteContent.deleteMany({
            conference: conf,
            $or: [{ key: null }, { key: 'null' }]
        });
        if (nullDel.deletedCount > 0) {
            console.log(`  🗑️  Deleted ${nullDel.deletedCount} document(s) with null key.`);
        } else {
            console.log(`  ℹ️  No null-key documents found.`);
        }

        // ── Step 2: Clean polluted sections ─────────────────────────────────
        for (const [sectionKey, allowedFields] of Object.entries(ALLOWED_FIELDS)) {
            const doc = await SiteContent.findOne({ conference: conf, key: sectionKey });
            if (!doc) {
                console.log(`  ⏭️  Section "${sectionKey}" — not found, skipping.`);
                continue;
            }

            const currentData = doc.data || {};
            const currentKeys = Object.keys(currentData);
            const extraKeys = currentKeys.filter(k => !allowedFields.includes(k));

            if (extraKeys.length === 0) {
                console.log(`  ✓  Section "${sectionKey}" — already clean (${currentKeys.length} fields).`);
                continue;
            }

            const cleanedData = pickAllowed(currentData, allowedFields);

            // Use $set to fully replace the data subdocument
            await SiteContent.findOneAndUpdate(
                { conference: conf, key: sectionKey },
                { $set: { data: cleanedData, updatedAt: new Date() } },
                { new: true }
            );

            console.log(
                `  🧹  Section "${sectionKey}" — removed ${extraKeys.length} extra field(s):\n` +
                `       Removed: [${extraKeys.join(', ')}]\n` +
                `       Kept:    [${Object.keys(cleanedData).join(', ')}]`
            );
        }
    }

    await mongoose.disconnect();
    console.log('\n🏁  Done. Disconnected from MongoDB.');
}

clean().catch(err => {
    console.error('❌  Fatal error:', err.message);
    process.exit(1);
});
