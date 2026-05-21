// Test Firestore Connection
// Run: node test-firestore-connection.js

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  console.log('✅ Firebase Admin initialized successfully');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  const db = admin.firestore();

  // Test 1: Write to Firestore
  async function testWrite() {
    console.log('\n📝 Testing Firestore Write...');
    try {
      const testDoc = await db.collection('test_connection').add({
        message: 'Test connection',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Write successful! Document ID:', testDoc.id);
      return testDoc.id;
    } catch (error) {
      console.error('❌ Write failed:', error.message);
      throw error;
    }
  }

  // Test 2: Read from Firestore
  async function testRead(docId) {
    console.log('\n📖 Testing Firestore Read...');
    try {
      const doc = await db.collection('test_connection').doc(docId).get();
      if (doc.exists) {
        console.log('✅ Read successful! Data:', doc.data());
      } else {
        console.log('❌ Document not found');
      }
    } catch (error) {
      console.error('❌ Read failed:', error.message);
      throw error;
    }
  }

  // Test 3: Delete test document
  async function testDelete(docId) {
    console.log('\n🗑️  Cleaning up test document...');
    try {
      await db.collection('test_connection').doc(docId).delete();
      console.log('✅ Cleanup successful!');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  // Test 4: Check collections
  async function checkCollections() {
    console.log('\n📚 Checking existing collections...');
    try {
      const collections = await db.listCollections();
      console.log('✅ Collections found:');
      collections.forEach(col => {
        console.log('  -', col.id);
      });
    } catch (error) {
      console.error('❌ Failed to list collections:', error.message);
    }
  }

  // Run all tests
  async function runTests() {
    console.log('🚀 Starting Firestore Connection Tests...\n');
    console.log('=' .repeat(50));

    try {
      // Check collections
      await checkCollections();

      // Test write
      const docId = await testWrite();

      // Test read
      await testRead(docId);

      // Cleanup
      await testDelete(docId);

      console.log('\n' + '='.repeat(50));
      console.log('✅ All tests passed! Firestore connection is working.');
      console.log('=' .repeat(50));
    } catch (error) {
      console.log('\n' + '='.repeat(50));
      console.log('❌ Tests failed! Check the errors above.');
      console.log('=' .repeat(50));
      process.exit(1);
    }

    process.exit(0);
  }

  runTests();

} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.error('\nPlease check:');
  console.error('1. .env.local file exists');
  console.error('2. FIREBASE_PRIVATE_KEY is correct');
  console.error('3. FIREBASE_CLIENT_EMAIL is correct');
  console.error('4. NEXT_PUBLIC_FIREBASE_PROJECT_ID is correct');
  process.exit(1);
}
