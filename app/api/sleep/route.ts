import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, calculateSleepHours } from '@/src/lib/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '30');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const db = getDb();
    
    // Get all sleep logs for user, filter by date in memory to avoid index requirement
    const snapshot = await db
      .collection(COLLECTIONS.SLEEP_LOGS)
      .where('userId', '==', authUser.uid)
      .get();

    const sleepLogs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        
        // Serialize timestamps properly
        return {
          id: doc.id,
          userId: data.userId,
          sleepTime: data.sleepTime ? {
            seconds: data.sleepTime._seconds || data.sleepTime.seconds,
            nanoseconds: data.sleepTime._nanoseconds || data.sleepTime.nanoseconds,
          } : null,
          wakeUpTime: data.wakeUpTime ? {
            seconds: data.wakeUpTime._seconds || data.wakeUpTime.seconds,
            nanoseconds: data.wakeUpTime._nanoseconds || data.wakeUpTime.nanoseconds,
          } : null,
          totalHours: Number(data.totalHours) || 0,
          quality: data.quality || 'good',
          note: data.note || null,
          createdAt: data.createdAt ? {
            seconds: data.createdAt._seconds || data.createdAt.seconds,
            nanoseconds: data.createdAt._nanoseconds || data.createdAt.nanoseconds,
          } : null,
          _createdAtDate: data.createdAt ? 
            new Date((data.createdAt._seconds || data.createdAt.seconds) * 1000) : 
            new Date(),
        };
      })
      .filter(log => log._createdAtDate >= startDate) // Filter in memory
      .sort((a, b) => b._createdAtDate.getTime() - a._createdAtDate.getTime()) // Sort in memory
      .slice(0, limitCount) // Limit in memory
      .map(({ _createdAtDate, ...log }) => log); // Remove temp field

    return successResponse(sleepLogs);
  } catch (error: any) {
    console.error('Get sleep logs error:', error);
    return errorResponse(error.message || 'Failed to get sleep logs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { sleepTime, wakeUpTime, quality, note } = body;

    if (!sleepTime || !wakeUpTime) {
      return errorResponse('Sleep time and wake up time are required');
    }

    const totalHours = calculateSleepHours(new Date(sleepTime), new Date(wakeUpTime));

    const db = getDb();
    const sleepData = {
      userId: authUser.uid,
      sleepTime: Timestamp.fromDate(new Date(sleepTime)),
      wakeUpTime: Timestamp.fromDate(new Date(wakeUpTime)),
      totalHours,
      quality: quality || 'good',
      note: note || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.SLEEP_LOGS).add(sleepData);

    return successResponse({ id: docRef.id, ...sleepData }, 'Sleep log created successfully');
  } catch (error: any) {
    console.error('Create sleep log error:', error);
    return errorResponse(error.message || 'Failed to create sleep log', 500);
  }
}
