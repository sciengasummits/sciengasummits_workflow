import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const media = await Media.findById(id);
        
        if (!media) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const base64Data = media.data.split(',')[1] || media.data;
        const buffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': media.mimetype,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (err) {
        return new NextResponse('Server error', { status: 500 });
    }
}
