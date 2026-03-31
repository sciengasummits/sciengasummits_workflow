import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const all = await SiteContent.find({ conference: conf });
        const result = {};
        all.forEach(item => { result[item.key] = item.data; });
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
