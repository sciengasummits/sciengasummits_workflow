import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function POST(request) {
    try {
        await dbConnect();
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const media = new Media({
            filename: file.name,
            mimetype: file.type,
            data: base64,
            conference: formData.get('conference') || 'liutex'
        });
        await media.save();

        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        
        // Return a URL that points to our media serving route
        const url = `${protocol}://${host}/api/media/${media._id}`;
        
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
