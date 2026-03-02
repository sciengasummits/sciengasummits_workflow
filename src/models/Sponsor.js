import mongoose from 'mongoose';

const SponsorSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    name: { type: String, required: true },
    logo: String,
    link: String,
    type: { type: String, enum: ['sponsor', 'media_partner'], default: 'media_partner' },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);
