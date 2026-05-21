import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { createDocument, queryDocuments, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    const filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = [
      { field: 'userId', operator: '==', value: authUser.uid },
    ];

    if (category) {
      filters.push({ field: 'category', operator: '==', value: category });
    }

    const achievements = await queryDocuments(
      COLLECTIONS.ACHIEVEMENTS,
      filters,
      'unlockedAt',
      'desc',
      limitCount
    );

    return successResponse(achievements);
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return errorResponse(error.message || 'Failed to get achievements', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { title, description, icon, category } = body;

    if (!title || !description || !category) {
      return errorResponse('Title, description, and category are required');
    }

    const achievementId = await createDocument(COLLECTIONS.ACHIEVEMENTS, {
      userId: authUser.uid,
      title,
      description,
      icon: icon || '🏆',
      category,
      unlockedAt: new Date(),
    });

    return successResponse({ id: achievementId }, 'Achievement unlocked!');
  } catch (error: any) {
    console.error('Create achievement error:', error);
    return errorResponse(error.message || 'Failed to create achievement', 500);
  }
}
