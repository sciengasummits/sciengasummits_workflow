import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';
import { requireAuth } from '@/lib/auth';

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
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const body = await request.json();
        const allowed = ['name', 'logo', 'website', 'type', 'order', 'visible', 'conference', 'description'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const sponsor = new Sponsor(sanitized);
        await sponsor.save();
        return NextResponse.json(sponsor, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
