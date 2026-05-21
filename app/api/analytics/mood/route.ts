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
      .collection(COLLECTIONS.MOODS)
      .where('userId', '==', authUser.uid)
      .get();

    // Filter and process in memory
    const moods = snapshot.docs
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
          mood: data.mood || 'neutral',
          createdAt: logDate,
        };
      })
      .filter(log => log.createdAt >= startDate)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(`Mood analytics: Found ${moods.length} logs for last ${days} days`);

    // Count mood frequencies
    const moodCounts: { [key: string]: number } = {};
    moods.forEach((mood: any) => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    // Find most frequent mood
    let mostFrequent = 'neutral';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = mood;
      }
    });

    // Prepare chart data
    const labels = Object.keys(moodCounts);
    const data = Object.values(moodCounts);

    return successResponse({
      labels,
      data,
      mostFrequent,
      total: moods.length,
      breakdown: moodCounts,
    });
  } catch (error: any) {
    console.error('Get mood analytics error:', error);
    return errorResponse(error.message || 'Failed to get mood analytics', 500);
  }
}
