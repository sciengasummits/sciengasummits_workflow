require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const smtpUser = process.env.AIROBOTSML_SMTP_USER || 'airobotsml@sciengasummits.com';
const smtpPass = (process.env.AIROBOTSML_SMTP_PASS || 'rjoq kwez hzue jupa').replace(/\s/g, '');

console.log('Transporter configuration:');
console.log(`- SMTP_USER: ${smtpUser}`);
console.log(`- SMTP_PASS length: ${smtpPass.length}`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
});

console.log('Sending test email via airobotsml transporter...');
transporter.sendMail({
    from: `"AI ROBOTS ML 2027 Summit" <${smtpUser}>`,
    to: smtpUser,
    subject: 'AIROBOTSML SMTP Verification OTP',
    text: 'Your verification code is: 123456. This confirms the new SMTP transporter works perfectly.',
}).then(info => {
    console.log('✅ SMTP verification email sent successfully!', info.messageId);
}).catch(err => {
    console.error('❌ Failed to send SMTP verification email:', err);
});
