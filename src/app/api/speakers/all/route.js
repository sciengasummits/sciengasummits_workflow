import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';
import { requireAuth } from '@/lib/auth';

// ── Admin endpoint: returns ALL speakers (including hidden ones) ──
export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

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
