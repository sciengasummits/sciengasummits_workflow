import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const type = searchParams.get('type');
        const filter = { visible: true, conference: conf };
        if (type) filter.type = type;
        const sponsors = await Sponsor.find(filter).sort({ order: 1 });
        return NextResponse.json(sponsors);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const sponsor = new Sponsor(body);
        await sponsor.save();
        return NextResponse.json(sponsor, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
