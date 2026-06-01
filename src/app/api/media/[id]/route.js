import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

// Global cache to persist across hot reloads in development and speed up production
const mediaCache = global._mediaCache || (global._mediaCache = new Map());

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Check memory cache first (instantly returns cached image buffer)
        const cached = mediaCache.get(id);
        if (cached) {
            return new NextResponse(cached.buffer, {
                headers: {
                    'Content-Type': cached.mimetype,
                    'Content-Length': cached.buffer.length.toString(),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        await dbConnect();
        const media = await Media.findById(id).lean();
        
        if (!media) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const base64Data = media.data.split(',')[1] || media.data;
        const buffer = Buffer.from(base64Data, 'base64');

        // Store in cache
        mediaCache.set(id, {
            buffer: buffer,
            mimetype: media.mimetype,
        });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': media.mimetype,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (err) {
        console.error('Error in api/media/[id]:', err);
        return new NextResponse('Server error: ' + err.message, { status: 500 });
    }
}

