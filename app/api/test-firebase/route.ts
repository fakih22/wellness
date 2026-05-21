import { NextRequest } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Firebase connection...');
    console.log('📍 Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    const startTime = Date.now();
    
    // Test Firestore connection by querying a collection
    const testQuery = query(collection(db, 'users'), limit(1));
    await getDocs(testQuery);
    
    const endTime = Date.now();
    
    console.log('✅ Firebase connected successfully!');
    console.log(`⏱️ Connection time: ${endTime - startTime}ms`);
    
    return Response.json({
      success: true,
      message: 'Firebase connection successful! ✅',
      service: 'Firebase Firestore',
      connectionTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error('❌ Firebase connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    return Response.json(
      {
        success: false,
        message: 'Firebase connection failed! ❌',
        service: 'Firebase Firestore',
        error: error.message,
        errorCode: error.code,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hint: 'Make sure Firebase is properly configured in .env.local',
      },
      { status: 500 }
    );
  }
}
