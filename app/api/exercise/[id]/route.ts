import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getDocument, updateDocument, deleteDocument, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';

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
    const { type, duration, calories, intensity, note } = body;

    // Check if exercise belongs to user
    const existingExercise = await getDocument(COLLECTIONS.EXERCISE_LOGS, id);
    if (!existingExercise || (existingExercise as any).userId !== authUser.uid) {
      return errorResponse('Exercise not found', 404);
    }

    const updateData: any = {};
    if (type) updateData.type = type;
    if (duration) updateData.duration = duration;
    if (calories) updateData.calories = calories;
    if (intensity) updateData.intensity = intensity;
    if (note !== undefined) updateData.note = note;

    await updateDocument(COLLECTIONS.EXERCISE_LOGS, id, updateData);

    const updatedExercise = await getDocument(COLLECTIONS.EXERCISE_LOGS, id);

    return successResponse(updatedExercise, 'Exercise updated successfully');
  } catch (error: any) {
    console.error('Update exercise error:', error);
    return errorResponse(error.message || 'Failed to update exercise', 500);
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

    // Check if exercise belongs to user
    const existingExercise = await getDocument(COLLECTIONS.EXERCISE_LOGS, id);
    if (!existingExercise || (existingExercise as any).userId !== authUser.uid) {
      return errorResponse('Exercise not found', 404);
    }

    await deleteDocument(COLLECTIONS.EXERCISE_LOGS, id);

    return successResponse(null, 'Exercise deleted successfully');
  } catch (error: any) {
    console.error('Delete exercise error:', error);
    return errorResponse(error.message || 'Failed to delete exercise', 500);
  }
}
