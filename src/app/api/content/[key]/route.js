import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { key } = await params;
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const item = await SiteContent.findOne({ conference: conf, key });
        if (!item) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        return NextResponse.json(item.data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { key } = await params;
        const body = await request.json();
        const { conference: conf = 'liutex', ...bodyData } = body;
        const patch = {};
        for (const [field, value] of Object.entries(bodyData)) {
            patch[`data.${field}`] = value;
        }
        const result = await SiteContent.findOneAndUpdate(
            { conference: conf, key },
            { $set: { ...patch, conference: conf } },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, data: result.data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
