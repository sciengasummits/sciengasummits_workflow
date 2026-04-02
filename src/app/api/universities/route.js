import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import University from '@/models/University';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        // Admin view includes hidden ones
        const universities = await University.find({ conference: conf }).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(universities);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const body = await request.json();
        const allowed = ['name', 'link', 'image', 'order', 'visible', 'conference'];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        if (!sanitized.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        
        const university = new University(sanitized);
        await university.save();
        return NextResponse.json(university, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
