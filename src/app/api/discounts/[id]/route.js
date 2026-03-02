import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Discount from '@/models/Discount';

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Discount.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
