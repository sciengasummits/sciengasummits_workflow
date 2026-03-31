import mongoose from 'mongoose';

const SponsorSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    name: { type: String, required: true },
    logo: String,
    link: String,
    type: { type: String, enum: ['sponsor', 'media_partner', 'collaboration'], default: 'media_partner' },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Clear cached model to ensure the updated enum is loaded
delete mongoose.models.Sponsor;

export default mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);
