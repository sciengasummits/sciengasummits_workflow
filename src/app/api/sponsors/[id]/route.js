import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const allowed = ['name', 'logo', 'link', 'type', 'order', 'visible', 'conference', 'description'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const sponsor = await Sponsor.findByIdAndUpdate(id, sanitized, { new: true });
        if (!sponsor) return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
        return NextResponse.json(sponsor);
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
        await Sponsor.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
