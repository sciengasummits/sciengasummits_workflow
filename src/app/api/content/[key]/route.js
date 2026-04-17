import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { key } = await params;
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const item = await SiteContent.findOne({ conference: conf, key });
        if (!item) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        return NextResponse.json(item.data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { key } = await params;
        const body = await request.json();
        const { conference: conf = 'fluid', _items, ...bodyData } = body;

        let updateOp;
        if (_items !== undefined) {
          // Overwrite the whole data block if _items is provided (modern format)
          updateOp = { $set: { data: _items, conference: conf } };
        } else {
          const patch = {};
          for (const [field, value] of Object.entries(bodyData)) {
            if (field.startsWith('$')) continue;
            patch[`data.${field}`] = value;
          }
          updateOp = { $set: { ...patch, conference: conf } };
        }

        const result = await SiteContent.findOneAndUpdate(
            { conference: conf, key },
            updateOp,
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, data: result.data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
