import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';

// Maximum file size: 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;
// Allowed image extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
// Allowed MIME types
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export async function POST(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        const formData = await request.formData();
        const file = formData.get('image');
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // ── File size validation ──
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 25MB.' }, { status: 413 });
        }

        // ── Extension validation ──
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file type "${ext}". Only images are allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // ── MIME type validation ──
        if (file.type && !ALLOWED_MIMES.some(mime => file.type.includes(mime.split('/')[1]))) {
            return NextResponse.json(
                { error: `Invalid MIME type "${file.type}". Only image files are allowed.` },
                { status: 400 }
            );
        }

        // ── Sanitize filename (prevent path traversal) ──
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = unique + ext;
        const filepath = path.join(uploadsDir, filename);

        await writeFile(filepath, buffer);

        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const url = `${protocol}://${host}/uploads/${filename}`;
        return NextResponse.json({ url, filename });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
