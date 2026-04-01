import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function POST(request) {
    try {
        await dbConnect();
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

        // Validate file size (MongoDB BSON limit is ~16MB, but base64 adds ~33% overhead)
        const bytes = await file.arrayBuffer();
        if (bytes.byteLength === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 });
        }
        if (bytes.byteLength > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const media = new Media({
            filename: file.name,
            mimetype: file.type,
            data: base64,
            size: bytes.byteLength,
            conference: formData.get('conference') || 'liutex'
        });
        await media.save();

        // Return relative path — works on any domain without extra env vars
        const url = `/api/media/${media._id}`;
        
        return NextResponse.json({ 
            url, 
            id: media._id, 
            filename: file.name,
            originalName: file.name,
            message: 'File saved to MongoDB' 
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
