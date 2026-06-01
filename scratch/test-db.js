const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Load environment variables from the .env.local file
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

dns.setDefaultResultOrder('ipv4first');

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 15000,
  family: 4,
};

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }
  
  console.log('Attempting to connect to MongoDB Atlas...');
  console.log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // obfuscate password
  
  try {
    await mongoose.connect(uri, mongoOptions);
    console.log('\n======================================================');
    console.log('✅ SUCCESS! Connection to MongoDB Atlas was successful!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n======================================================');
    console.error('❌ CONNECTION FAILED!');
    console.error('Error Details:', err.message);
    if (err.message.includes('SSL alert number 80') || err.message.includes('tlsv1 alert internal error')) {
      console.error('\n👉 DIAGNOSIS: MongoDB Atlas is rejecting your public IP address.');
      console.error('Please make sure your current local public IP is whitelisted.');
    }
    console.error('======================================================\n');
    process.exit(1);
  }
}

test();
