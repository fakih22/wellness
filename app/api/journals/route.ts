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
    const limitCount = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const db = getDb();
    
    // Get total count
    const countSnapshot = await db
      .collection(COLLECTIONS.JOURNALS)
      .where('userId', '==', authUser.uid)
      .count()
      .get();
    const total = countSnapshot.data().count;

    // Get paginated journals
    const snapshot = await db
      .collection(COLLECTIONS.JOURNALS)
      .where('userId', '==', authUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return successResponse({
      journals,
      pagination: {
        page,
        limit: limitCount,
        total,
        pages: Math.ceil(total / limitCount),
      },
    });
  } catch (error: any) {
    console.error('Get journals error:', error);
    return errorResponse(error.message || 'Failed to get journals', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { title, content, mood, tags } = body;

    if (!title || !content) {
      return errorResponse('Title and content are required');
    }

    const db = getDb();
    const journalData = {
      userId: authUser.uid,
      title,
      content,
      mood: mood || null,
      tags: tags || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.JOURNALS).add(journalData);

    return successResponse({ id: docRef.id, ...journalData }, 'Journal created successfully');
  } catch (error: any) {
    console.error('Create journal error:', error);
    return errorResponse(error.message || 'Failed to create journal', 500);
  }
}
