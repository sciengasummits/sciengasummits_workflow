
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://scienga:scienga@ac-blmkilg-shard-00-00.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-01.dphtrai.mongodb.net:27017,ac-blmkilg-shard-00-02.dphtrai.mongodb.net:27017/?ssl=true&replicaSet=atlas-6k8qyx-shard-0&authSource=admin&appName=SciEng";

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
