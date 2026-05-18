async function run() {
    try {
        const res = await fetch('https://civilenv-nextjs.vercel.app/api/content/contact?conference=civilenv');
        console.log('Status:', res.status);
        console.log('Headers:', Object.fromEntries(res.headers.entries()));
        const body = await res.text();
        console.log('Body:', body.substring(0, 1000));
    } catch (err) {
        console.error(err);
    }
}
run();
