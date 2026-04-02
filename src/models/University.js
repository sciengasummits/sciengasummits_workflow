import mongoose from 'mongoose';

const UniversitySchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    name: { type: String, required: true },
    image: String,
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.University || mongoose.model('University', UniversitySchema);
