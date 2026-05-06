
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://LIUTEXVORTEXSUMMIT2026:LIUTEX@ac-oydsouh-shard-00-00.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-01.sozesho.mongodb.net:27017,ac-oydsouh-shard-00-02.sozesho.mongodb.net:27017/?ssl=true&replicaSet=atlas-w8th4c-shard-0&authSource=admin&retryWrites=true&w=majority&appName=LIUTEXVORTEXSUMMIT2026";

const SiteContentSchema = new mongoose.Schema({
  conference: String,
  key: String,
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema, 'sitecontents');

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const brochure = await SiteContent.findOne({ conference: 'renewable', key: 'brochure' });
    console.log('--- RENEWABLE BROCHURE DATA ---');
    console.log(JSON.stringify(brochure, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
