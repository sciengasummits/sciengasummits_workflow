import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const category = searchParams.get('category');
        const filter = { visible: true, conference: conf };
        if (category) filter.category = category;
        const speakers = await Speaker.find(filter).sort({ order: 1, createdAt: 1 });
        return NextResponse.json(speakers);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const speaker = new Speaker(body);
        await speaker.save();
        return NextResponse.json(speaker, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
