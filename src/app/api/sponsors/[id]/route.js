import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const sponsor = await Sponsor.findByIdAndUpdate(id, body, { new: true });
        if (!sponsor) return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
        return NextResponse.json(sponsor);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Sponsor.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
