import mongoose from 'mongoose';

const WorkflowEmailSchema = new mongoose.Schema({
    conference: { type: String, required: true, index: true },
    folder: { type: String, required: true, enum: ['inbox', 'sent', 'drafts', 'bin'], default: 'inbox', index: true },
    uid: { type: Number, index: true }, // IMAP UID
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.WorkflowEmail || mongoose.model('WorkflowEmail', WorkflowEmailSchema);
