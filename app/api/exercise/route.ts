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
    const period = searchParams.get('period') || 'week';
    const limitCount = parseInt(searchParams.get('limit') || '50');

    const db = getDb();
    
    // Fetch all user exercises first (without orderBy to avoid index issues)
    const snapshot = await db
      .collection(COLLECTIONS.EXERCISE_LOGS)
      .where('userId', '==', authUser.uid)
      .get();

    let exercises = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by period client-side
    const now = new Date();
    if (period === 'today') {
      const startOfDay = getStartOfDay();
      const endOfDay = getEndOfDay();
      exercises = exercises.filter((ex: any) => {
        const createdAt = ex.createdAt?.toDate ? ex.createdAt.toDate() : new Date(ex.createdAt);
        return createdAt >= startOfDay && createdAt <= endOfDay;
      });
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      exercises = exercises.filter((ex: any) => {
        const createdAt = ex.createdAt?.toDate ? ex.createdAt.toDate() : new Date(ex.createdAt);
        return createdAt >= weekAgo;
      });
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      exercises = exercises.filter((ex: any) => {
        const createdAt = ex.createdAt?.toDate ? ex.createdAt.toDate() : new Date(ex.createdAt);
        return createdAt >= monthAgo;
      });
    }

    // Sort by createdAt descending client-side
    exercises.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Limit results
    exercises = exercises.slice(0, limitCount);

    console.log(`Fetched ${exercises.length} exercises for user ${authUser.uid}`);
    return successResponse(exercises);
  } catch (error: any) {
    console.error('Get exercises error:', error);
    return errorResponse(error.message || 'Failed to get exercises', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { type, duration, calories, intensity, note } = body;

    console.log('Creating exercise:', { type, duration, calories, intensity, note, userId: authUser.uid });

    if (!type || !duration || !calories) {
      return errorResponse('Type, duration, and calories are required');
    }

    const db = getDb();
    const exerciseData = {
      userId: authUser.uid,
      type,
      duration: Number(duration),
      calories: Number(calories),
      intensity: intensity || 'medium',
      note: note || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.EXERCISE_LOGS).add(exerciseData);
    console.log('Exercise created with ID:', docRef.id);

    return successResponse({ id: docRef.id, ...exerciseData }, 'Exercise logged successfully');
  } catch (error: any) {
    console.error('Create exercise error:', error);
    return errorResponse(error.message || 'Failed to log exercise', 500);
  }
}
