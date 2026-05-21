const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('='.repeat(60));
console.log('🧪 MONGODB CONNECTION TEST');
console.log('='.repeat(60));
console.log('');

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('📍 MongoDB URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
console.log('');
console.log('🔄 Attempting to connect...');
console.log('');

const startTime = Date.now();

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    const endTime = Date.now();
    const connectionTime = endTime - startTime;
    
    console.log('✅ SUCCESS! MongoDB Connected!');
    console.log('');
    console.log('📊 Connection Details:');
    console.log('   - Connection Time:', connectionTime + 'ms');
    console.log('   - Database:', mongoose.connection.db.databaseName);
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Port:', mongoose.connection.port);
    console.log('   - Ready State:', mongoose.connection.readyState);
    console.log('');
    console.log('='.repeat(60));
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    const endTime = Date.now();
    const attemptTime = endTime - startTime;
    
    console.error('❌ FAILED! MongoDB Connection Error');
    console.error('');
    console.error('📊 Error Details:');
    console.error('   - Error Name:', error.name);
    console.error('   - Error Code:', error.code);
    console.error('   - Error Message:', error.message);
    console.error('   - Syscall:', error.syscall);
    console.error('   - Hostname:', error.hostname);
    console.error('   - Attempt Time:', attemptTime + 'ms');
    console.error('');
    console.error('🔍 Possible Causes:');
    console.error('   1. IP Address not whitelisted in MongoDB Atlas');
    console.error('   2. Firewall/Network blocking connection');
    console.error('   3. Incorrect connection string');
    console.error('   4. MongoDB cluster is paused or unavailable');
    console.error('');
    console.error('💡 Solutions:');
    console.error('   1. Go to MongoDB Atlas → Network Access');
    console.error('   2. Add IP Address: 0.0.0.0/0 (Allow from anywhere)');
    console.error('   3. Wait 1-2 minutes for changes to apply');
    console.error('   4. Try again');
    console.error('');
    console.error('='.repeat(60));
    
    process.exit(1);
  });

// Timeout after 30 seconds
setTimeout(() => {
  console.error('');
  console.error('⏱️  TIMEOUT: Connection attempt exceeded 30 seconds');
  console.error('');
  console.error('This usually means:');
  console.error('   - Network/Firewall is blocking the connection');
  console.error('   - IP not whitelisted in MongoDB Atlas');
  console.error('');
  console.error('='.repeat(60));
  process.exit(1);
}, 30000);
