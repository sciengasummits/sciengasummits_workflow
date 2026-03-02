import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const sponsors = await Sponsor.find({ conference: conf }).sort({ order: 1 });
        return NextResponse.json(sponsors);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
