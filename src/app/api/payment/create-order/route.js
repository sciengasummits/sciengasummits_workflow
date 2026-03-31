import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const getRazorpay = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials not configured');
    }
    return new Razorpay({ key_id, key_secret });
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt, notes } = body;

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: notes || {},
        });

        return NextResponse.json(order);
    } catch (err) {
        console.error('Create order error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create payment order' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
