import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { RealEmailSender } from '@/lib/emailSender';

const emailSender = new RealEmailSender();

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Missing payment fields' }, { status: 400 });
        }

        // Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
        }

        // Update registration status to Paid & send admin notification email
        if (registrationId) {
            await dbConnect();
            const updatedReg = await Registration.findByIdAndUpdate(
                registrationId,
                {
                    status: 'Paid',
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                },
                { new: true }   // return the updated document
            );

            // Fire confirmation email — non-fatal if it fails
            if (updatedReg) {
                emailSender.sendRegistrationConfirmation(updatedReg, {
                    razorpay_order_id,
                    razorpay_payment_id,
                }).catch(err =>
                    console.error('⚠️  Registration email notification failed:', err.message)
                );
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
        console.error('Verify payment error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
