import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const speakers = await Speaker.find({ conference: conf }).sort({ order: 1, createdAt: 1 });
        return NextResponse.json(speakers);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
