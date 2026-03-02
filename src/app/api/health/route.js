import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    await dbConnect();
    return NextResponse.json({ status: 'ok', message: 'LIUTEX Dashboard API running on Next.js' });
}
