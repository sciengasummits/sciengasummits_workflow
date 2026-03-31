import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { CONFERENCE_ACCOUNTS } from '@/lib/conferences';
import { CONFERENCE_CONFIG } from '@/lib/conferences';
import { RealEmailSender } from '@/lib/emailSender';
import { generateSecureOTP, hashOTP, isOtpRateLimited } from '@/lib/auth';

const realEmailSender = new RealEmailSender();

async function sendOTPEmail(email, otp, username, conferenceId) {
  const conf = CONFERENCE_CONFIG[conferenceId] || {};
  const displayName = conf.displayName || 'Conference Management System';
  const accentColor = conf.accentColor || '#6366f1';

  const gradientEnd = conferenceId === 'liutex' ? '#8b5cf6'
    : conferenceId === 'foodagri' ? '#15803d'
      : conferenceId === 'fluid' ? '#0e7490'
        : conferenceId === 'renewable' ? '#15803d'
          : conferenceId === 'cyber' ? '#1d4ed8'
            : conferenceId === 'powereng' ? '#b45309'
              : conferenceId === 'iqces2026' ? '#1e3a8a'
                : '#8b5cf6';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${accentColor}, ${gradientEnd}); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Conference Management System</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${displayName}</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0;">Your Login OTP</h2>
        <p style="color: #64748b; margin: 0 0 20px 0;">
          Hello! You've requested to login with username: <strong>${username}</strong>
        </p>
        <div style="background: white; border: 2px solid ${accentColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your 6-digit OTP is:</p>
          <div style="font-size: 32px; font-weight: bold; color: ${accentColor}; letter-spacing: 8px; font-family: monospace;">${otp}</div>
        </div>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>⚠️ Important:</strong> This OTP is valid for <strong>10 minutes</strong> only.
            Do not share this code with anyone.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const emailPromise = realEmailSender.sendEmail(email, 'Your Login OTP - Conference Management System', htmlContent, otp, conferenceId);
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 25000);
    });
    const result = await Promise.race([emailPromise, timeoutPromise]);
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    return { success: true, messageId: result.messageId || `otp-${Date.now()}` };
  } catch (error) {
    console.error('Email error:', error.message);
    // Don't throw — return failure gracefully so the main route can continue
    return { success: false, error: error.message };
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, message: 'Username is required.' }, { status: 400 });
    }

    // ── Rate limiting: max 5 OTP requests per 10 minutes per username ──
    const rateLimitKey = username.toLowerCase();
    if (isOtpRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

    const account = CONFERENCE_ACCOUNTS.find(acc => acc.username.toLowerCase() === username.toLowerCase());
    if (!account) {
      // Use generic message to prevent username enumeration
      return NextResponse.json({ success: false, message: 'Invalid credentials. Please check and try again.' }, { status: 401 });
    }

    // ── Generate 6-digit OTP ──────────────────────────────────────
    const otp = generateSecureOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove existing OTPs for this user
    await OTP.deleteMany({ username: account.username });
    await OTP.create({
      username: account.username,
      otp: otpHash, // Store hashed OTP, not plaintext
      email: account.email,
      expiresAt,
      used: false
    });

    // ── Send email (non-blocking for the user flow) ──
    const emailResult = await sendOTPEmail(account.email, otp, account.username, account.conferenceId);
    
    if (!emailResult.success) {
      console.error(`[generate-otp] Could not send email: ${emailResult.error}`);
      // Fallback: If in development, log the OTP so we can still test
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[generate-otp] DEV FALLBACK - OTP is: ${otp}`);
      }
    }

    // Always log OTP in dev mode for easy testing without relying on email delivery
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[generate-otp] DEV MODE - Generated OTP: ${otp}`);
    }

    // ── SECURE: Do NOT include OTP in response ────────────────────
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${account.email.replace(/(.{2}).*(@.*)/, '$1***$2')}`,
      email: account.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 });
  }
}
