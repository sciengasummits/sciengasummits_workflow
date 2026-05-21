const nodemailer = require('nodemailer');

const creds = {
    user: 'cropsciengasummits@sciengasummits.com',
    pass: 'opvu nfae jwrd tmmn'
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: creds.user, pass: creds.pass },
    tls: { rejectUnauthorized: false },
});

console.log('Sending email...');
transporter.sendMail({
    from: `"Conference Management System" <${creds.user}>`,
    to: 'cropsciengasummits@sciengasummits.com',
    subject: 'Test OTP email',
    text: 'Your OTP is 123456.',
}).then(info => {
    console.log('Email sent successfully!', info.messageId);
}).catch(err => {
    console.error('Failed to send email:', err);
});
