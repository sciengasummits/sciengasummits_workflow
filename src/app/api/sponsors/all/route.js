import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';
import { requireAuth } from '@/lib/auth';

// ── Admin endpoint: returns ALL sponsors (including hidden ones) ──
export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

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
