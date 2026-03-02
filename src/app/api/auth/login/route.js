import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { CONFERENCE_ACCOUNTS } from '@/lib/conferences';

export async function POST(request) {
    try {
        await dbConnect();
        const { username, otp } = await request.json();

        if (!username || !otp) {
            return NextResponse.json({ success: false, message: 'Username and OTP are required.' }, { status: 400 });
        }

        const account = CONFERENCE_ACCOUNTS.find(acc => acc.username.toLowerCase() === username.toLowerCase());
        if (!account) {
            return NextResponse.json({ success: false, message: 'Username not found.' }, { status: 401 });
        }

        if (otp === '____') {
            return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 401 });
        }

        const otpRecord = await OTP.findOne({
            username: account.username,
            otp,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return NextResponse.json({ success: false, message: 'Invalid or expired OTP.' }, { status: 401 });
        }

        otpRecord.used = true;
        await otpRecord.save();

        return NextResponse.json({
            success: true,
            message: 'Login successful.',
            username: account.username,
            conferenceId: account.conferenceId,
            displayName: account.displayName,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
