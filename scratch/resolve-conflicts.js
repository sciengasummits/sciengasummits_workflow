const fs = require('fs');
const path = require('path');

// 1. Resolve src/lib/conferences.js
const confPath = path.join(__dirname, '../src/lib/conferences.js');
let confContent = fs.readFileSync(confPath, 'utf8');

// Replace CONFERENCE_ACCOUNTS conflict block
const accountsConflictRegex = /<<<<<<< HEAD([\s\S]*?)=======([\s\S]*?)>>>>>>> [a-f0-9]+/;
confContent = confContent.replace(accountsConflictRegex, (match, p1, p2) => {
    // Combine both blocks and clean any extra whitespace
    return p1.trim() + ',\n    {\n' + p2.trim();
});

// Replace CONFERENCE_CONFIG conflict block
confContent = confContent.replace(accountsConflictRegex, (match, p1, p2) => {
    return p1.trim() + '\n' + p2.trim();
});

fs.writeFileSync(confPath, confContent, 'utf8');
console.log('✅ Resolved src/lib/conferences.js');

// 2. Resolve src/app/api/auth/generate-otp/route.js
const otpPath = path.join(__dirname, '../src/app/api/auth/generate-otp/route.js');
let otpContent = fs.readFileSync(otpPath, 'utf8');
otpContent = otpContent.replace(accountsConflictRegex, (match, p1, p2) => {
    return p1.trim() + '\n' + p2.trim();
});
fs.writeFileSync(otpPath, otpContent, 'utf8');
console.log('✅ Resolved src/app/api/auth/generate-otp/route.js');

// 3. Resolve src/app/page.js
const pagePath = path.join(__dirname, '../src/app/page.js');
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = pageContent.replace(accountsConflictRegex, (match, p1, p2) => {
    return p1.trim() + '\n' + p2.trim();
});
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('✅ Resolved src/app/page.js');

// 4. Resolve src/lib/emailSender.js
const emailPath = path.join(__dirname, '../src/lib/emailSender.js');
let emailContent = fs.readFileSync(emailPath, 'utf8');
// Fix all occurrences of conflict markers in emailSender.js
while (accountsConflictRegex.test(emailContent)) {
    emailContent = emailContent.replace(accountsConflictRegex, (match, p1, p2) => {
        return p1.trim() + '\n' + p2.trim();
    });
}
fs.writeFileSync(emailPath, emailContent, 'utf8');
console.log('✅ Resolved src/lib/emailSender.js');
