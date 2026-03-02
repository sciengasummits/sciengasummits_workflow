import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.name);
        const filename = unique + ext;
        const filepath = path.join(uploadsDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;
        return NextResponse.json({ url, filename });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
