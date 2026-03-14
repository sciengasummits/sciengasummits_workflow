import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { CONFERENCE_ACCOUNTS } from '@/lib/conferences';
import { generateToken, verifyOTPHash, isLoginRateLimited, resetLoginAttempts } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        const { username, otp } = await request.json();

        if (!username || !otp) {
            return NextResponse.json({ success: false, message: 'Username and OTP are required.' }, { status: 400 });
        }

        // ── Rate limiting: max 10 login attempts per 15 minutes ──
        const rateLimitKey = username.toLowerCase();
        if (isLoginRateLimited(rateLimitKey)) {
            return NextResponse.json(
                { success: false, message: 'Too many login attempts. Please wait 15 minutes before trying again.' },
                { status: 429 }
            );
        }

        const account = CONFERENCE_ACCOUNTS.find(acc => acc.username.toLowerCase() === username.toLowerCase());
        if (!account) {
            return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
        }

        // Reject placeholder OTP
        if (otp === '______' || otp === '____') {
            return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 401 });
        }

        // ── Find all non-used, non-expired OTPs for this user ──
        const otpRecords = await OTP.find({
            username: account.username,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        // ── Verify OTP hash against stored records ──
        let matchedRecord = null;
        for (const record of otpRecords) {
            if (verifyOTPHash(otp, record.otp)) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            return NextResponse.json({ success: false, message: 'Invalid or expired OTP. Please try again.' }, { status: 401 });
        }

        // Mark OTP as used
        matchedRecord.used = true;
        await matchedRecord.save();

        // Reset rate limit on successful login
        resetLoginAttempts(rateLimitKey);

        // ── Generate JWT token for authenticated session ──
        const token = generateToken({
            username: account.username,
            conferenceId: account.conferenceId,
            displayName: account.displayName,
        });

        return NextResponse.json({
            success: true,
            message: 'Login successful.',
            username: account.username,
            conferenceId: account.conferenceId,
            displayName: account.displayName,
            token, // JWT token for authenticating subsequent API requests
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
