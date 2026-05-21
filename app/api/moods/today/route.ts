import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { queryDocuments, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay, getEndOfDay } from '@/src/lib/helpers';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const moods = await queryDocuments(
      COLLECTIONS.MOODS,
      [
        { field: 'userId', operator: '==', value: authUser.uid },
        { field: 'createdAt', operator: '>=', value: Timestamp.fromDate(getStartOfDay()) },
        { field: 'createdAt', operator: '<=', value: Timestamp.fromDate(getEndOfDay()) },
      ],
      'createdAt',
      'desc',
      1
    );

    const todayMood = moods.length > 0 ? moods[0] : null;

    return successResponse(todayMood);
  } catch (error: any) {
    console.error('Get today mood error:', error);
    return errorResponse(error.message || 'Failed to get today mood', 500);
  }
}
