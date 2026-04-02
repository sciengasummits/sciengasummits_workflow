import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import University from '@/models/University';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const allowed = ['name', 'image', 'order', 'visible', 'conference'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const updated = await University.findByIdAndUpdate(id, sanitized, { new: true });
        if (!updated) return NextResponse.json({ error: 'University not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        await University.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
