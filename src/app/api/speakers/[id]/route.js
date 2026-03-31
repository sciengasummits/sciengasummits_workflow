import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        // Sanitize: only allow known speaker fields
        const allowed = ['name', 'title', 'affiliation', 'bio', 'image', 'category', 'order', 'visible', 'conference', 'country', 'email', 'website', 'designation'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const speaker = await Speaker.findByIdAndUpdate(id, sanitized, { new: true });
        if (!speaker) return NextResponse.json({ error: 'Speaker not found' }, { status: 404 });
        return NextResponse.json(speaker);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        await Speaker.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
