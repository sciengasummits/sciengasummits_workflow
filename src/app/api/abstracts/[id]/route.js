import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const abs = await Abstract.findByIdAndUpdate(id, body, { new: true });
        if (!abs) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(abs);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
