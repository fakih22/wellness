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
    const { mood, note } = body;

    // Check if mood belongs to user
    const existingMood = await getDocument(COLLECTIONS.MOODS, id);
    if (!existingMood || (existingMood as any).userId !== authUser.uid) {
      return errorResponse('Mood not found', 404);
    }

    const updateData: any = {};
    if (mood) updateData.mood = mood;
    if (note !== undefined) updateData.note = note;

    await updateDocument(COLLECTIONS.MOODS, id, updateData);

    const updatedMood = await getDocument(COLLECTIONS.MOODS, id);

    return successResponse(updatedMood, 'Mood updated successfully');
  } catch (error: any) {
    console.error('Update mood error:', error);
    return errorResponse(error.message || 'Failed to update mood', 500);
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

    // Check if mood belongs to user
    const existingMood = await getDocument(COLLECTIONS.MOODS, id);
    if (!existingMood || (existingMood as any).userId !== authUser.uid) {
      return errorResponse('Mood not found', 404);
    }

    await deleteDocument(COLLECTIONS.MOODS, id);

    return successResponse(null, 'Mood deleted successfully');
  } catch (error: any) {
    console.error('Delete mood error:', error);
    return errorResponse(error.message || 'Failed to delete mood', 500);
  }
}
