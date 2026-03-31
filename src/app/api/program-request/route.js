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

        // Send email to Admin
        const adminPromise = realEmailSender.sendProgramRequestToAdmin({
            name,
            email,
            number,
            conferenceId: conference
        });

        // Send email to User
        const userPromise = realEmailSender.sendProgramRequestToUser({
            name,
            email,
            conferenceId: conference
        });

        // Wait for both emails to finish
        const [adminResult, userResult] = await Promise.all([adminPromise, userPromise]);

        if (!userResult.success) {
            console.error('[ProgramRequest] Failed to send user email', userResult.error);
        }
        if (!adminResult.success) {
            console.error('[ProgramRequest] Failed to send admin email', adminResult.error);
        }

        return NextResponse.json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Program request endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process request', error: error.message }, { status: 500 });
    }
}
