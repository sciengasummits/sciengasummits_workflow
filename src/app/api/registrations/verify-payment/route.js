import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId,
        } = body;

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
        }

        // Update registration status to Paid
        if (registrationId) {
            await dbConnect();
            await Registration.findByIdAndUpdate(registrationId, {
                status: 'Paid',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
            });
        }

        return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
        console.error('Verify payment error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
