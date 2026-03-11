import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    email: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, {
    bufferCommands: false
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
