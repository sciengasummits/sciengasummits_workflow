import { CONFERENCE_ACCOUNTS } from '../src/lib/conferences.js';

function resolveAccount(username) {
    return CONFERENCE_ACCOUNTS.find(acc => 
        acc.username.toLowerCase() === username.toLowerCase() ||
        (acc.aliases && acc.aliases.some(alias => alias.toLowerCase() === username.toLowerCase()))
    );
}

const testCases = [
    // Clean Energy
    { input: 'CLEANENGTECHSUMMIT2026', expectedId: 'cleaneng' },
    { input: 'cleanengtech2026', expectedId: 'cleaneng' },
    { input: 'CLEANENGTECH2026', expectedId: 'cleaneng' },
    
    // Crop Science
    { input: 'cropsciengsummit2026', expectedId: 'cropscieng' },
    { input: 'CROPSCIENG2026', expectedId: 'cropscieng' },
    
    // Health Med
    { input: 'HEALTHMEDSUMMIT2026', expectedId: 'healthmed' },
    { input: 'HEALTHMED2026', expectedId: 'healthmed' },

    // AI ROBOTS ML
    { input: 'AIROBOTSML2027', expectedId: 'airobotsml' },
    { input: 'AIROBOTS2027', expectedId: 'airobotsml' },
    { input: 'airobotsml2027', expectedId: 'airobotsml' },
    { input: 'airobots2027', expectedId: 'airobotsml' },
    
    // Non-existent
    { input: 'NONEXISTENT', expectedId: null }
];

console.log('--- Testing Username Lookup Logic (ESM) ---');
let allPassed = true;
for (const tc of testCases) {
    const acc = resolveAccount(tc.input);
    const actualId = acc ? acc.conferenceId : null;
    const passed = actualId === tc.expectedId;
    console.log(`Input: "${tc.input}" -> Resolved: "${actualId}" | Expected: "${tc.expectedId}" | PASSED: ${passed}`);
    if (!passed) allPassed = false;
}

if (allPassed) {
    console.log('\n✅ All username and alias matching tests passed successfully!');
} else {
    console.error('\n❌ Some tests failed.');
    process.exit(1);
}
