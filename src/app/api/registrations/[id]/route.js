import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const reg = await Registration.findByIdAndUpdate(id, body, { new: true });
        if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(reg);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
