import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        // Sanitize: only allow status-related fields
        const allowed = ['status', 'txnId', 'paymentId', 'orderId', 'notes'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const reg = await Registration.findByIdAndUpdate(id, sanitized, { new: true });
        if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(reg);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
