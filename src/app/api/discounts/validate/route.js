import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Discount from '@/models/Discount';

export async function POST(request) {
    try {
        await dbConnect();
        const { conference = 'liutex', coupon } = await request.json();
        if (!coupon) return NextResponse.json({ valid: false, message: 'No coupon provided.' });
        const discount = await Discount.findOne({
            conference,
            coupon: coupon.trim().toUpperCase(),
            active: true,
        });
        if (!discount) return NextResponse.json({ valid: false, message: 'Invalid or expired discount code.' });
        return NextResponse.json({
            valid: true,
            percentage: discount.percentage,
            category: discount.category,
            coupon: discount.coupon,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
