import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';
import { requireAuth } from '@/lib/auth';

// GET — Admin reads all abstracts (requires auth)
export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

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

// POST — Public abstract submission (no auth required - this is from the website)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        // Sanitize: only allow known abstract fields
        const allowed = ['conference', 'name', 'email', 'phone', 'affiliation', 'country', 'topic', 'title', 'abstractText', 'fileUrl', 'fileName', 'category', 'coAuthors'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const abs = new Abstract(sanitized);
        await abs.save();
        return NextResponse.json(abs, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
