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
            conference: formData.get('conference') || 'liutex'
        });
        
        await media.save();

        // ✅ Use NEXT_PUBLIC_WORKFLOW_URL env var if set (production), otherwise
        //    derive from request headers. Avoids saving "localhost:3000" URLs in DB.
        const envBase = process.env.NEXT_PUBLIC_WORKFLOW_URL;
        let base;
        if (envBase) {
            base = envBase.replace(/\/$/, ''); // strip trailing slash
        } else {
            const host = request.headers.get('host') || 'localhost:3000';
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            base = `${protocol}://${host}`;
        }
        const url = `${base}/api/media/${media._id}`;
        
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
