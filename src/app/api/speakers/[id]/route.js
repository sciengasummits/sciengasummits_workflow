import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Speaker from '@/models/Speaker';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const speaker = await Speaker.findByIdAndUpdate(id, body, { new: true });
        if (!speaker) return NextResponse.json({ error: 'Speaker not found' }, { status: 404 });
        return NextResponse.json(speaker);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Speaker.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
