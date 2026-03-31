import { NextResponse } from 'next/server';
import { RealEmailSender } from '@/lib/emailSender';

const realEmailSender = new RealEmailSender();

export async function POST(request) {
    try {
        const payload = await request.json();
        const { name, email, phone, conference = 'liutex' } = payload;

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        // Send email ONLY to Admin
        const adminResult = await realEmailSender.sendSubscribeToAdmin({
            name: name || 'N/A',
            email,
            phone: phone || 'N/A',
            conferenceId: conference
        });

        if (!adminResult.success) {
            console.error('[Subscribe] Failed to send admin email', adminResult.error);
        }

        return NextResponse.json({ success: true, message: 'Subscription successful' });
    } catch (error) {
        console.error('Subscribe endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process request', error: error.message }, { status: 500 });
    }
}
