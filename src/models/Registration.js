import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
    conference:         { type: String, default: 'liutex', index: true },
    title:              { type: String, default: '' },
    name:               { type: String, required: true },
    email:              { type: String, required: true },
    phone:              { type: String, default: '' },
    country:            { type: String, default: '' },

    // "affiliation" is the canonical field name sent by all conference frontends.
    // The old "company" field is kept for backward compatibility with existing records.
    affiliation:        { type: String, default: '' },
    company:            { type: String, default: '' },

    address:            { type: String, default: '' },

    // "category" is the canonical field name.
    // The old "registrationCategory" is kept for backward compatibility.
    category:           { type: String, default: '' },
    registrationCategory: { type: String, default: '' },

    packageType:        { type: String, default: '' },
    sponsorship:        { type: String, default: '' },
    accommodation:      { type: String, default: '' },
    accompanyingPerson: { type: Boolean, default: false },
    description:        { type: String, default: '' },

    // "amount" is the canonical field name.
    // The old "totalAmount" is kept for backward compatibility.
    amount:             { type: Number, default: 0 },
    totalAmount:        { type: Number, default: 0 },

    currency:           { type: String, default: 'USD' },
    coupon:             { type: String, default: '' },
    discountPercentage: { type: Number, default: 0 },
    finalAmount:        { type: Number, default: 0 },

    status:             { type: String, default: 'Pending' },
    paymentMethod:      { type: String, default: '' },

    // Razorpay identifiers
    razorpayOrderId:    { type: String, default: '' },
    razorpayPaymentId:  { type: String, default: '' },
    txnId:              { type: String, default: '' },
    paymentId:          { type: String, default: '' },
    orderId:            { type: String, default: '' },

    createdAt:          { type: Date, default: Date.now },
});

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
