import { NextResponse } from 'next/server';
import { RealEmailSender } from '@/lib/emailSender';
import dbConnect from '@/lib/mongodb';
import MailMessage from '@/models/MailMessage';

const realEmailSender = new RealEmailSender();

export async function POST(request) {
    try {
        const payload = await request.json();
        const { name, email, subject, message, conference = 'liutex' } = payload;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        // Save to Database
        try {
            await dbConnect();
            await MailMessage.create({
                conference,
                type: 'contact',
                name,
                email,
                subject,
                message
            });
        } catch (dbErr) {
            console.error('[ContactUs] Failed to save to database:', dbErr);
        }

        // Send email ONLY to Admin
        const adminResult = await realEmailSender.sendContactToAdmin({
            name,
            email,
            subject,
            message,
            conferenceId: conference
        });

        if (!adminResult.success) {
            console.error('[ContactUs] Failed to send admin email', adminResult.error);
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process request', error: error.message }, { status: 500 });
    }
}

