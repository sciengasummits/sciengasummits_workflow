import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';

// Maximum file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;
// Allowed document extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip'];
// Allowed MIME types
const ALLOWED_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
];

export async function POST(request) {
    // ── File uploads for abstract submissions are public, but still need validation ──
    // Note: This endpoint is used by the public abstract submission form
    // If you want to restrict it to admins only, uncomment:
    // const auth = requireAuth(request);
    // if (auth.error) return auth.error;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // ── File size validation ──
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 20MB.' }, { status: 413 });
        }

        // ── Extension validation ──
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file type "${ext}". Only PDF, DOC, DOCX, and ZIP files are allowed.` },
                { status: 400 }
            );
        }

        // ── Sanitize filename (prevent path traversal) ──
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = unique + ext;
        const filepath = path.join(uploadsDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;
        return NextResponse.json({ url, filename, originalName: sanitizedOriginalName });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
