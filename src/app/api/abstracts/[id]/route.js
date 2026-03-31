import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        // Sanitize: only allow status updates
        const allowed = ['status', 'notes', 'reviewComments'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const abs = await Abstract.findByIdAndUpdate(id, sanitized, { new: true });
        if (!abs) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(abs);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
