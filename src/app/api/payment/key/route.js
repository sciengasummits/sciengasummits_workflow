import { NextResponse } from 'next/server';

export async function GET() {
    const key = process.env.RAZORPAY_KEY_ID;
    if (!key) {
        return NextResponse.json({ error: 'Razorpay key not configured' }, { status: 500 });
    }
    return NextResponse.json({ key });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
