import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Discount from '@/models/Discount';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const discounts = await Discount.find({ conference: conf }).sort({ createdAt: -1 });
        return NextResponse.json(discounts);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const { conference = 'liutex', coupon, category, percentage } = await request.json();
        if (!coupon || !percentage) {
            return NextResponse.json({ error: 'coupon and percentage are required' }, { status: 400 });
        }
        const discount = await Discount.findOneAndUpdate(
            { conference, coupon: coupon.trim().toUpperCase() },
            { conference, coupon: coupon.trim().toUpperCase(), category: category || 'registration', percentage, active: true },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json(discount, { status: 201 });
    } catch (err) {
        if (err.code === 11000) return NextResponse.json({ error: 'Coupon code already exists.' }, { status: 409 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
