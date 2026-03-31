import mongoose from 'mongoose';

const AbstractSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    title: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    organization: { type: String, default: '' },
    country: { type: String, default: '' },
    interest: { type: String, default: '' },
    topic: { type: String, default: '' },
    address: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Abstract || mongoose.model('Abstract', AbstractSchema);
