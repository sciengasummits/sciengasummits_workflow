const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { RealEmailSender } = require('../src/lib/emailSender.js');

async function test() {
  const sender = new RealEmailSender();
  console.log("Attempting to send email via cropscieng transporter...");
  const res = await sender.sendEmail(
    'sciengasummits@gmail.com', // test recipient
    'Test OTP Email',
    '<h1>Test OTP</h1><p>Your OTP is 123456</p>',
    '123456',
    'cropscieng'
  );
  console.log("Result:", res);
}

test();
