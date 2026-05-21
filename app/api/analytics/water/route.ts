import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Use Admin SDK
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.WATER_LOGS)
      .where('userId', '==', authUser.uid)
      .get();

    // Filter and process in memory
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
          amount: Number(data.amount) || 0,
          date: logDate,
        };
      })
      .filter(log => log.date >= startDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log(`Water analytics: Found ${waterLogs.length} logs for last ${days} days`);

    // Prepare chart data
    const labels = waterLogs.map((log: any) => {
      return log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = waterLogs.map((log: any) => log.amount);

    // Calculate statistics
    const total = data.reduce((sum: number, amount: number) => sum + amount, 0);
    const average = data.length > 0 ? total / data.length : 0;

    return successResponse({
      labels,
      data,
      average: Math.round(average * 100) / 100,
      total: Math.round(total * 100) / 100,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Get water analytics error:', error);
    return errorResponse(error.message || 'Failed to get water analytics', 500);
  }
}
