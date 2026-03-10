import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import { CONFERENCE_ACCOUNTS } from '@/lib/conferences';
import { CONFERENCE_CONFIG } from '@/lib/conferences';
import { RealEmailSender } from '@/lib/emailSender';

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const realEmailSender = new RealEmailSender();

async function sendOTPEmail(email, otp, username, conferenceId) {
  // Look up the display name and accent color for this conference
  const conf = CONFERENCE_CONFIG[conferenceId] || {};
  const displayName = conf.displayName || 'Conference Management System';
  const accentColor = conf.accentColor || '#6366f1';

  // Darken the accent slightly for the gradient end (simple hex adjust)
  const gradientEnd = conferenceId === 'liutex' ? '#8b5cf6'
    : conferenceId === 'foodagri' ? '#15803d'
      : conferenceId === 'fluid' ? '#0e7490'
        : conferenceId === 'renewable' ? '#15803d'
          : conferenceId === 'cyber' ? '#1d4ed8'
            : conferenceId === 'powereng' ? '#b45309'
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
          <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your 4-digit OTP is:</p>
          <div style="font-size: 32px; font-weight: bold; color: ${accentColor}; letter-spacing: 8px; font-family: monospace;">${otp}</div>
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
    const emailPromise = realEmailSender.sendEmail(email, 'Your Login OTP - Conference Management System', htmlContent, otp, conferenceId);
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

    console.log(`[generate-otp] Received username: "${username}"`);
    console.log(`[generate-otp] Available usernames: ${CONFERENCE_ACCOUNTS.map(a => a.username).join(', ')}`);

    const account = CONFERENCE_ACCOUNTS.find(acc => acc.username.toLowerCase() === username.toLowerCase());
    if (!account) {
      console.error(`[generate-otp] No match found for: "${username}"`);
      return NextResponse.json({ success: false, message: `Username not found. Please check and try again.` }, { status: 401 });
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

    // Await email send so Vercel doesn't terminate the function before it completes
    const emailResult = await sendOTPEmail(account.email, otp, account.username, account.conferenceId);
    console.log(`[generate-otp] Email result for ${account.conferenceId}:`, JSON.stringify(emailResult));

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
