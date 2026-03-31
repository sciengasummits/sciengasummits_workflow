import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Discount from '@/models/Discount';
import { requireAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        await Discount.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
