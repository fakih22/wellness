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
    const { name, icon, color, frequency, targetDays, isActive } = body;

    // Check if habit belongs to user
    const existingHabit = await getDocument(COLLECTIONS.HABITS, id);
    if (!existingHabit || (existingHabit as any).userId !== authUser.uid) {
      return errorResponse('Habit not found', 404);
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (frequency) updateData.frequency = frequency;
    if (targetDays) updateData.targetDays = targetDays;
    if (isActive !== undefined) updateData.isActive = isActive;

    await updateDocument(COLLECTIONS.HABITS, id, updateData);

    const updatedHabit = await getDocument(COLLECTIONS.HABITS, id);

    return successResponse(updatedHabit, 'Habit updated successfully');
  } catch (error: any) {
    console.error('Update habit error:', error);
    return errorResponse(error.message || 'Failed to update habit', 500);
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

    // Check if habit belongs to user
    const existingHabit = await getDocument(COLLECTIONS.HABITS, id);
    if (!existingHabit || (existingHabit as any).userId !== authUser.uid) {
      return errorResponse('Habit not found', 404);
    }

    await deleteDocument(COLLECTIONS.HABITS, id);

    return successResponse(null, 'Habit deleted successfully');
  } catch (error: any) {
    console.error('Delete habit error:', error);
    return errorResponse(error.message || 'Failed to delete habit', 500);
  }
}
