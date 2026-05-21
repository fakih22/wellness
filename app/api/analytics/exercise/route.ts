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
      .collection(COLLECTIONS.EXERCISE_LOGS)
      .where('userId', '==', authUser.uid)
      .get();

    // Filter and process in memory
    const exercises = snapshot.docs
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
          type: data.type || 'other',
          duration: Number(data.duration) || 0,
          calories: Number(data.calories) || 0,
          createdAt: logDate,
        };
      })
      .filter(log => log.createdAt >= startDate)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(`Exercise analytics: Found ${exercises.length} logs for last ${days} days`);

    // Calculate totals
    const totalDuration = exercises.reduce((sum: number, ex: any) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum: number, ex: any) => sum + ex.calories, 0);

    // Group by type
    const byType: { [key: string]: { count: number; duration: number; calories: number } } = {};
    exercises.forEach((ex: any) => {
      if (!byType[ex.type]) {
        byType[ex.type] = { count: 0, duration: 0, calories: 0 };
      }
      byType[ex.type].count++;
      byType[ex.type].duration += ex.duration;
      byType[ex.type].calories += ex.calories;
    });

    // Convert to array
    const byTypeArray = Object.entries(byType).map(([type, stats]) => ({
      type,
      ...stats,
    }));

    // Daily breakdown
    const dailyData: { [key: string]: { duration: number; calories: number } } = {};
    exercises.forEach((ex: any) => {
      const dateStr = ex.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { duration: 0, calories: 0 };
      }
      dailyData[dateStr].duration += ex.duration;
      dailyData[dateStr].calories += ex.calories;
    });

    const labels = Object.keys(dailyData);
    const durationData = Object.values(dailyData).map(d => d.duration);
    const caloriesData = Object.values(dailyData).map(d => d.calories);

    return successResponse({
      totalDuration,
      totalCalories,
      totalWorkouts: exercises.length,
      byType: byTypeArray,
      daily: {
        labels,
        duration: durationData,
        calories: caloriesData,
      },
    });
  } catch (error: any) {
    console.error('Get exercise analytics error:', error);
    return errorResponse(error.message || 'Failed to get exercise analytics', 500);
  }
}
