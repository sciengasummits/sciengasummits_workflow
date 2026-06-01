const fs = require('fs');
const execSync = require('child_process').execSync;

const dirs = [
    'Advancenanosummit_nextjs',
    'Healthmedsummit_nextjs',
    'Opticphoton_nextjs',
    'Polymat_nextjs',
    'WSCSN2027_nextjs',
    'cleanengtechh_nextjs',
    'cropscienga_nextjs',
    'sciengasummits_workflow'
];

dirs.forEach(d => {
    const p = '/Users/apple/Downloads/Radhika Mam Changes/' + d;
    if (fs.existsSync(p + '/.git')) {
        console.log(`\n\n========================================`);
        console.log(`Processing repository: ${d}`);
        console.log(`========================================`);
        
        try {
            const status = execSync('git status --porcelain', { cwd: p }).toString().trim();
            
            if (status) {
                console.log(`Found uncommitted changes in ${d}:\n${status}`);
                console.log(`Staging & committing...`);
                execSync('git add .', { cwd: p });
                execSync('git commit -m "Fix serverless OTP email sending and update hero viewport layout"', { cwd: p });
            } else {
                console.log(`No uncommitted changes in ${d}.`);
            }
            
            console.log(`Pulling remote changes to stay up to date...`);
            try {
                execSync('git pull --rebase', { cwd: p });
            } catch(pullErr) {
                console.log(`Rebase pull failed, trying standard merge pull...`);
                try {
                    execSync('git pull --no-rebase', { cwd: p });
                } catch(mergeErr) {
                    console.log(`⚠️ Merge pull failed too. Skipping push for ${d} to prevent conflicts.`);
                    return;
                }
            }
            
            console.log(`Pushing to GitHub...`);
            try {
                const pushOut = execSync('git push', { cwd: p }).toString();
                console.log(`✅ Successfully pushed ${d}!`);
                if (pushOut.trim()) console.log(pushOut);
            } catch(pushErr) {
                console.log(`⚠️ Push failed for ${d}: ${pushErr.message}`);
            }
        } catch (err) {
            console.error(`❌ Error processing repository ${d}:`, err.message);
        }
    } else {
        console.log(`Directory ${d} is not a git repository.`);
    }
});
