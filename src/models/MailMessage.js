import mongoose from 'mongoose';

const MailMessageSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    type: { type: String, required: true, enum: ['contact', 'subscribe', 'program'], index: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.MailMessage || mongoose.model('MailMessage', MailMessageSchema);
