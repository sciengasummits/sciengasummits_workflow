import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const formData = await request.formData();
        const file = formData.get('image');
        
        if (!file) {
            return NextResponse.json({ error: 'No file received in form data' }, { status: 400 });
        }

        // Basic validation
        const fileName = file.name || 'uploaded_image';
        const fileType = file.type || 'image/jpeg';

        const bytes = await file.arrayBuffer();
        if (bytes.byteLength === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 });
        }

        const buffer = Buffer.from(bytes);
        const base64 = `data:${fileType};base64,${buffer.toString('base64')}`;

        const media = new Media({
            filename: fileName,
            mimetype: fileType,
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
            message: 'Image saved to MongoDB' 
        });
    } catch (err) {
        console.error('SERVER UPLOAD ERROR:', err);
        return NextResponse.json({ error: `Server error during upload: ${err.message}` }, { status: 500 });
    }
}
