import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Razorpay instantiated inside the handler to prevent build-time crashes

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, registrationId, description } = body;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Razorpay amount is in paise (multiply USD cents by 100? No — amount is already in USD cents)
        // Frontend sends total in USD dollars, so multiply by 100 to get paise equivalent
        // Actually Razorpay works in smallest currency unit: for USD that's cents, for INR that's paise
        // The frontend calculates total in USD, so amount * 100 gives cents
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // convert to smallest unit (cents for USD)
            currency: 'USD',
            receipt: registrationId || `reg_${Date.now()}`,
            notes: {
                description: description || 'Conference Registration',
                registrationId: registrationId || '',
            },
        });

        return NextResponse.json({ order });
    } catch (err) {
        console.error('Create order error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
