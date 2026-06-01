const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://scienga:scienga@ac-blmkilg-shard-00-00.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-01.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-02.dphtrai.mongodb.net:27017/?ssl=true&replicaSet=atlas-6k8qyx-shard-0&authSource=admin&appName=SciEng';

async function main() {
    try {
        console.log("Connecting to new MongoDB cluster...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connection Successful!");
        
        // List databases/collections or print stats
        const adminDb = mongoose.connection.useDb('admin').db;
        const list = await adminDb.admin().listDatabases();
        console.log("Available databases:");
        list.databases.forEach(db => {
            console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        await mongoose.disconnect();
        console.log("Disconnected successfully.");
    } catch (err) {
        console.error("❌ Connection failed:", err);
    }
}

main();
