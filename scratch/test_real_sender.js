require('dotenv').config({ path: '.env.local' });
const { RealEmailSender } = require('../src/lib/emailSender.js');

const sender = new RealEmailSender();
console.log('--- Initialized RealEmailSender ---');
console.log('Accounts config:');
for (const [id, account] of Object.entries(sender._accounts)) {
    console.log(`- ${id}: user=${account.user}, pass length=${account.pass ? account.pass.length : 0}, hasPass=${!!account.pass && !account.pass.startsWith('REPLACE_WITH')}`);
}

console.log('\nTransporters built:');
console.log(Object.keys(sender._transporters));

console.log('\nTesting sendEmail for cropscieng...');
sender.sendEmail(
    'cropsciengasummits@sciengasummits.com',
    'Test OTP',
    '<p>Testing from RealEmailSender wrapper</p>',
    '654321',
    'cropscieng'
).then(res => {
    console.log('Result for cropscieng:', res);
}).catch(err => {
    console.error('Error for cropscieng:', err);
});
