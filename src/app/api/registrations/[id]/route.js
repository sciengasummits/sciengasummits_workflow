import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAuth } from '@/lib/auth';

// PATCH — update status
export async function PATCH(request, { params }) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const updated = await Registration.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — permanently remove a registration
export async function DELETE(request, { params }) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Registration.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Registration deleted' });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
