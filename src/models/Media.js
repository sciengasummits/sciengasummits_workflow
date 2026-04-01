import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    data: { type: String, required: true }, // Base64 encoded data (data:mimetype;base64,...)
    size: { type: Number }, // Original file size in bytes
    conference: { type: String, default: 'liutex', index: true },
    createdAt: { type: Date, default: Date.now }
});

// Index for faster lookups
MediaSchema.index({ conference: 1, createdAt: -1 });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
