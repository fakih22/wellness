import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = getDb();
    let query = db.collection(COLLECTIONS.GOALS).where('userId', '==', authUser.uid);

    if (status) {
      query = query.where('status', '==', status);
    }

    // Remove orderBy to avoid Firebase composite index requirement
    // We'll sort in memory instead
    const snapshot = await query.get();
    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt in memory (descending - newest first)
    goals.sort((a: any, b: any) => {
      const aTime = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const bTime = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return successResponse(goals);
  } catch (error: any) {
    console.error('Get goals error:', error);
    return errorResponse(error.message || 'Failed to get goals', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { title, description, category, targetValue, unit, deadline } = body;

    if (!title || !category || !targetValue || !unit) {
      return errorResponse('Title, category, target value, and unit are required');
    }

    const db = getDb();
    const goalData: any = {
      userId: authUser.uid,
      title,
      description: description || null,
      category,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit,
      status: 'active',
      progress: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (deadline) {
      goalData.deadline = Timestamp.fromDate(new Date(deadline));
    }

    const docRef = await db.collection(COLLECTIONS.GOALS).add(goalData);

    return successResponse({ id: docRef.id, ...goalData }, 'Goal created successfully');
  } catch (error: any) {
    console.error('Create goal error:', error);
    return errorResponse(error.message || 'Failed to create goal', 500);
  }
}
