import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { queryDocuments, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const sleepLogs = await queryDocuments(
      COLLECTIONS.SLEEP_LOGS,
      [{ field: 'userId', operator: '==', value: authUser.uid }],
      'createdAt',
      'desc',
      1
    );

    const latestSleep = sleepLogs.length > 0 ? sleepLogs[0] : null;

    return successResponse(latestSleep);
  } catch (error: any) {
    console.error('Get latest sleep error:', error);
    return errorResponse(error.message || 'Failed to get latest sleep', 500);
  }
}
