const fs = require('fs');
const path = require('path');

const NEW_MONGODB_URI = 'MONGODB_URI=mongodb://scienga:scienga@ac-blmkilg-shard-00-00.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-01.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-02.dphtrai.mongodb.net:27017/?ssl=true&replicaSet=atlas-6k8qyx-shard-0&authSource=admin&appName=SciEng';

const envFiles = [
    '/Users/apple/Downloads/Radhika Mam Changes/cleanengtechh_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/WSCSN2027_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/Polymat_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/Opticphoton_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/Healthmedsummit_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/Advancenanosummit_nextjs/.env',
    '/Users/apple/Downloads/Radhika Mam Changes/cropscienga_nextjs/.env'
];

envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Processing: ${file}`);
        let content = fs.readFileSync(file, 'utf8');
        
        // Match MONGODB_URI=... line and replace it
        const originalContent = content;
        content = content.replace(/^MONGODB_URI=.*/m, NEW_MONGODB_URI);
        
        if (originalContent !== content) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Successfully updated MONGODB_URI in ${file}`);
        } else {
            console.log(`MONGODB_URI was already up-to-date or not found in ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
