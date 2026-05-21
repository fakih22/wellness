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

    // Use Admin SDK
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.SLEEP_LOGS)
      .where('userId', '==', authUser.uid)
      .get();

    // Filter and process in memory
    const sleepLogs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        
        // Parse createdAt date
        let logDate;
        if (data.createdAt && data.createdAt._seconds) {
          logDate = new Date(data.createdAt._seconds * 1000);
        } else if (data.createdAt && data.createdAt.seconds) {
          logDate = new Date(data.createdAt.seconds * 1000);
        } else if (data.createdAt && data.createdAt.toDate) {
          logDate = data.createdAt.toDate();
        } else {
          logDate = new Date(data.createdAt);
        }
        
        return {
          id: doc.id,
          totalHours: Number(data.totalHours) || 0,
          quality: data.quality || 'good',
          createdAt: logDate,
        };
      })
      .filter(log => log.createdAt >= startDate)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(`Sleep analytics: Found ${sleepLogs.length} logs for last ${days} days`);

    // Prepare chart data
    const labels = sleepLogs.map((log: any) => {
      return log.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = sleepLogs.map((log: any) => log.totalHours);

    // Calculate statistics
    const total = data.reduce((sum: number, hours: number) => sum + hours, 0);
    const average = data.length > 0 ? total / data.length : 0;

    // Quality breakdown
    const qualityCounts: { [key: string]: number } = {};
    sleepLogs.forEach((log: any) => {
      qualityCounts[log.quality] = (qualityCounts[log.quality] || 0) + 1;
    });

    return successResponse({
      labels,
      data,
      average: Math.round(average * 10) / 10,
      total: Math.round(total * 10) / 10,
      count: data.length,
      qualityBreakdown: qualityCounts,
    });
  } catch (error: any) {
    console.error('Get sleep analytics error:', error);
    return errorResponse(error.message || 'Failed to get sleep analytics', 500);
  }
}
