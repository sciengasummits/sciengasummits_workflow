import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const key = process.env.RAZORPAY_KEY_ID;
        if (!key) {
            return NextResponse.json({ error: 'Razorpay key not configured' }, { status: 500 });
        }
        return NextResponse.json({ key });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
