import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { updateWaterLog, COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Query water logs using Admin SDK
    // Simplified query without composite index (filter in memory instead)
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.WATER_LOGS)
      .where('userId', '==', authUser.uid)
      .get(); // Get all user's logs, filter by date in memory

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const waterLogs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        
        // Parse date
        let logDate;
        if (data.date && data.date._seconds) {
          logDate = new Date(data.date._seconds * 1000);
        } else if (data.date && data.date.seconds) {
          logDate = new Date(data.date.seconds * 1000);
        } else if (data.date && data.date.toDate) {
          logDate = data.date.toDate();
        } else {
          logDate = new Date(data.date);
        }
        
        return {
          id: doc.id,
          userId: data.userId,
          amount: Number(data.amount) || 0,
          date: data.date ? {
            seconds: data.date._seconds || data.date.seconds,
            nanoseconds: data.date._nanoseconds || data.date.nanoseconds,
          } : null,
          createdAt: data.createdAt ? {
            seconds: data.createdAt._seconds || data.createdAt.seconds,
            nanoseconds: data.createdAt._nanoseconds || data.createdAt.nanoseconds,
          } : null,
          updatedAt: data.updatedAt ? {
            seconds: data.updatedAt._seconds || data.updatedAt.seconds,
            nanoseconds: data.updatedAt._nanoseconds || data.updatedAt.nanoseconds,
          } : null,
          _logDate: logDate, // For filtering
        };
      })
      .filter(log => log._logDate >= startDate) // Filter by date in memory
      .sort((a, b) => b._logDate.getTime() - a._logDate.getTime()) // Sort in memory
      .map(({ _logDate, ...log }) => log); // Remove temp field

    console.log('Water logs fetched:', waterLogs.length, 'logs'); // Debug

    return successResponse(waterLogs);
  } catch (error: any) {
    console.error('Get water logs error:', error);
    return errorResponse(error.message || 'Failed to get water logs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { amount } = body;

    console.log('POST water - amount:', amount, 'userId:', authUser.uid); // Debug

    if (amount === undefined || amount === null || isNaN(amount)) {
      return errorResponse('Valid amount is required');
    }

    const today = getStartOfDay();
    const waterLog = await updateWaterLog(authUser.uid, today, amount);

    console.log('Water log updated:', waterLog); // Debug

    if (!waterLog) {
      return errorResponse('Failed to create water log', 500);
    }

    // Return the updated water log with proper format
    const logData = waterLog as any;
    return successResponse({
      id: waterLog.id,
      userId: logData.userId || authUser.uid,
      amount: Number(logData.amount) || 0,
      date: logData.date ? {
        seconds: logData.date._seconds || logData.date.seconds,
        nanoseconds: logData.date._nanoseconds || logData.date.nanoseconds,
      } : null,
    }, 'Water intake logged successfully');
  } catch (error: any) {
    console.error('Log water error:', error);
    return errorResponse(error.message || 'Failed to log water intake', 500);
  }
}
