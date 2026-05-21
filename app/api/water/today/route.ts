import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getOrCreateWaterLog, updateWaterLog, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const today = getStartOfDay();
    const waterLog = await getOrCreateWaterLog(authUser.uid, today);

    return successResponse(waterLog || { amount: 0, date: today });
  } catch (error: any) {
    console.error('Get today water error:', error);
    return errorResponse(error.message || 'Failed to get today water intake', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { increment } = body;

    if (increment === undefined) {
      return errorResponse('Increment value is required');
    }

    const today = getStartOfDay();
    
    // Get current water log
    const currentLog = await getOrCreateWaterLog(authUser.uid, today);
    const currentAmount = (currentLog as any)?.amount || 0;
    const newAmount = Math.max(0, currentAmount + increment);

    // Update with new amount
    const waterLog = await updateWaterLog(authUser.uid, today, newAmount);

    return successResponse(waterLog, 'Water intake updated successfully');
  } catch (error: any) {
    console.error('Update water error:', error);
    return errorResponse(error.message || 'Failed to update water intake', 500);
  }
}
