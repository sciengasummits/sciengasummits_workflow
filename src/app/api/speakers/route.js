import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';
import { requireAuth } from '@/lib/auth';

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
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const body = await request.json();
        // Sanitize: only allow known speaker fields
        const allowed = ['name', 'title', 'affiliation', 'bio', 'image', 'category', 'order', 'visible', 'conference', 'country', 'email', 'website', 'designation'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const speaker = new Speaker(sanitized);
        await speaker.save();
        return NextResponse.json(speaker, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
