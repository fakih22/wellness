import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getDocument, updateDocument, deleteDocument, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, calculateSleepHours } from '@/src/lib/helpers';
import { Timestamp } from 'firebase-admin/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { sleepTime, wakeUpTime, quality, note } = body;

    // Check if sleep log belongs to user
    const existingLog = await getDocument(COLLECTIONS.SLEEP_LOGS, id);
    if (!existingLog || (existingLog as any).userId !== authUser.uid) {
      return errorResponse('Sleep log not found', 404);
    }

    const updateData: any = {};
    if (sleepTime) updateData.sleepTime = Timestamp.fromDate(new Date(sleepTime));
    if (wakeUpTime) updateData.wakeUpTime = Timestamp.fromDate(new Date(wakeUpTime));
    if (quality) updateData.quality = quality;
    if (note !== undefined) updateData.note = note;

    // Recalculate total hours if times are updated
    if (sleepTime || wakeUpTime) {
      const existingLogData = existingLog as any;
      const newSleepTime = sleepTime ? new Date(sleepTime) : (existingLogData.sleepTime?.toDate ? existingLogData.sleepTime.toDate() : new Date(existingLogData.sleepTime));
      const newWakeUpTime = wakeUpTime ? new Date(wakeUpTime) : (existingLogData.wakeUpTime?.toDate ? existingLogData.wakeUpTime.toDate() : new Date(existingLogData.wakeUpTime));
      updateData.totalHours = calculateSleepHours(newSleepTime, newWakeUpTime);
    }

    await updateDocument(COLLECTIONS.SLEEP_LOGS, id, updateData);

    const updatedLog = await getDocument(COLLECTIONS.SLEEP_LOGS, id);

    return successResponse(updatedLog, 'Sleep log updated successfully');
  } catch (error: any) {
    console.error('Update sleep log error:', error);
    return errorResponse(error.message || 'Failed to update sleep log', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    // Check if sleep log belongs to user
    const existingLog = await getDocument(COLLECTIONS.SLEEP_LOGS, id);
    if (!existingLog || (existingLog as any).userId !== authUser.uid) {
      return errorResponse('Sleep log not found', 404);
    }

    await deleteDocument(COLLECTIONS.SLEEP_LOGS, id);

    return successResponse(null, 'Sleep log deleted successfully');
  } catch (error: any) {
    console.error('Delete sleep log error:', error);
    return errorResponse(error.message || 'Failed to delete sleep log', 500);
  }
}
