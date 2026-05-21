import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    const db = getDb();
    let query = db.collection(COLLECTIONS.HABITS).where('userId', '==', authUser.uid);

    if (isActive !== null) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return successResponse(habits);
  } catch (error: any) {
    console.error('Get habits error:', error);
    return errorResponse(error.message || 'Failed to get habits', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, icon, color, frequency, targetDays } = body;

    if (!name) {
      return errorResponse('Habit name is required');
    }

    const db = getDb();
    const habitData = {
      userId: authUser.uid,
      name,
      icon: icon || '✓',
      color: color || '#3B82F6',
      frequency: frequency || 'daily',
      targetDays: targetDays || 7,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.HABITS).add(habitData);

    return successResponse({ id: docRef.id, ...habitData }, 'Habit created successfully');
  } catch (error: any) {
    console.error('Create habit error:', error);
    return errorResponse(error.message || 'Failed to create habit', 500);
  }
}
