import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

SiteContentSchema.index({ conference: 1, key: 1 }, { unique: true });

SiteContentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
