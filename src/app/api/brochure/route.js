import { NextResponse } from 'next/server';
import { RealEmailSender } from '@/lib/emailSender';

const realEmailSender = new RealEmailSender();

export async function POST(request) {
    try {
        const payload = await request.json();
        const { name, email, number, conference = 'liutex' } = payload;

        if (!name || !email || !number) {
            return NextResponse.json({ success: false, message: 'Name, email, and contact number are required' }, { status: 400 });
        }

        // Send email ONLY to Admin
        const adminResult = await realEmailSender.sendBrochureToAdmin({
            name,
            email,
            number,
            conferenceId: conference
        });

        if (!adminResult.success) {
            console.error('[BrochureRequest] Failed to send admin email', adminResult.error);
        }

        return NextResponse.json({ success: true, message: 'Brochure request recorded' });
    } catch (error) {
        console.error('Brochure request endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process request', error: error.message }, { status: 500 });
    }
}
