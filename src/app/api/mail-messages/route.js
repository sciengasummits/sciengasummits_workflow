import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MailMessage from '@/models/MailMessage';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const type = searchParams.get('type'); // optional filter

        const filter = { conference: conf };
        if (type) filter.type = type;

        const messages = await MailMessage.find(filter)
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        return NextResponse.json({ success: true, messages });
    } catch (err) {
        console.error('Mail messages API error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
