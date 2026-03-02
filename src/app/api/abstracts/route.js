import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const abstracts = await Abstract.find({ conference: conf }).sort({ createdAt: -1 });
        return NextResponse.json(abstracts);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const abs = new Abstract(body);
        await abs.save();
        return NextResponse.json(abs, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
