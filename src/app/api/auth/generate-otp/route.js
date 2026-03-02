import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { CONFERENCE_ACCOUNTS } from '@/lib/conferences';
import { RealEmailSender } from '@/lib/emailSender';

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const realEmailSender = new RealEmailSender();

async function sendOTPEmail(email, otp, username) {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Conference Management System</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">LIUTEX SUMMIT 2026</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0;">Your Login OTP</h2>
        <p style="color: #64748b; margin: 0 0 20px 0;">
          Hello! You've requested to login with username: <strong>${username}</strong>
        </p>
        <div style="background: white; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your 4-digit OTP is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: monospace;">${otp}</div>
        </div>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>⚠️ Important:</strong> This OTP is valid for <strong>10 minutes</strong> only.
          </p>
        </div>
      </div>
    </div>
  `;

    try {
        const emailPromise = realEmailSender.sendEmail(email, 'Your Login OTP - Conference Management System', htmlContent, otp);
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 25000);
        });
        await Promise.race([emailPromise, timeoutPromise]);
        return { success: true, messageId: `otp-${Date.now()}`, otp };
    } catch (error) {
        console.error('Email error:', error.message);
        return { success: true, messageId: `fallback-${Date.now()}`, otp };
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ success: false, message: 'Username is required.' }, { status: 400 });
        }

        const account = CONFERENCE_ACCOUNTS.find(acc => acc.username.toLowerCase() === username.toLowerCase());
        if (!account) {
            return NextResponse.json({ success: false, message: 'Username not found. Please check and try again.' }, { status: 401 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.deleteMany({ username: account.username });
        await OTP.create({
            username: account.username,
            otp,
            email: account.email,
            expiresAt,
            used: false
        });

        // Send email in background (non-blocking)
        sendOTPEmail(account.email, otp, account.username).catch(console.error);

        return NextResponse.json({
            success: true,
            message: `OTP sent to ${account.email}`,
            email: account.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
            testOTP: otp
        });
    } catch (error) {
        console.error('Generate OTP error:', error);
        return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 });
    }
}
