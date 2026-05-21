import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay, getEndOfDay } from '@/src/lib/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, all
    const limitCount = parseInt(searchParams.get('limit') || '30');

    const db = getDb();
    let query = db.collection(COLLECTIONS.MOODS).where('userId', '==', authUser.uid);

    // Filter by period
    if (period === 'day') {
      query = query
        .where('createdAt', '>=', Timestamp.fromDate(getStartOfDay()))
        .where('createdAt', '<=', Timestamp.fromDate(getEndOfDay()));
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.where('createdAt', '>=', Timestamp.fromDate(weekAgo));
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.where('createdAt', '>=', Timestamp.fromDate(monthAgo));
    }

    query = query.orderBy('createdAt', 'desc').limit(limitCount);

    const snapshot = await query.get();
    const moods = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return successResponse(moods);
  } catch (error: any) {
    console.error('Get moods error:', error);
    return errorResponse(error.message || 'Failed to get moods', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { mood, note } = body;

    if (!mood) {
      return errorResponse('Mood is required');
    }

    const validMoods = ['happy', 'calm', 'neutral', 'tired', 'stress', 'sad'];
    if (!validMoods.includes(mood)) {
      return errorResponse('Invalid mood value');
    }

    const db = getDb();
    const moodData = {
      userId: authUser.uid,
      mood,
      note: note || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.MOODS).add(moodData);

    const newMood = { id: docRef.id, ...moodData };

    return successResponse(newMood, 'Mood logged successfully');
  } catch (error: any) {
    console.error('Create mood error:', error);
    return errorResponse(error.message || 'Failed to log mood', 500);
  }
}
