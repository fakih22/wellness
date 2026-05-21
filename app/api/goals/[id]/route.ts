import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getDocument, updateDocument, deleteDocument, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';
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
    const { title, description, targetValue, currentValue, unit, deadline, status } = body;

    // Check if goal belongs to user
    const existingGoal = await getDocument(COLLECTIONS.GOALS, id);
    if (!existingGoal || (existingGoal as any).userId !== authUser.uid) {
      return errorResponse('Goal not found', 404);
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetValue) updateData.targetValue = targetValue;
    if (currentValue !== undefined) updateData.currentValue = currentValue;
    if (unit) updateData.unit = unit;
    if (deadline !== undefined) {
      updateData.deadline = deadline ? Timestamp.fromDate(new Date(deadline)) : null;
    }
    if (status) updateData.status = status;

    // Calculate progress if values are updated
    const newTargetValue = targetValue || (existingGoal as any).targetValue;
    const newCurrentValue = currentValue !== undefined ? currentValue : (existingGoal as any).currentValue;
    updateData.progress = Math.min(Math.round((newCurrentValue / newTargetValue) * 100), 100);
    
    // Auto-complete if progress reaches 100%
    if (updateData.progress >= 100) {
      updateData.status = 'completed';
    }

    await updateDocument(COLLECTIONS.GOALS, id, updateData);

    const updatedGoal = await getDocument(COLLECTIONS.GOALS, id);

    return successResponse(updatedGoal, 'Goal updated successfully');
  } catch (error: any) {
    console.error('Update goal error:', error);
    return errorResponse(error.message || 'Failed to update goal', 500);
  }
}

export async function PATCH(
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
    const { currentValue } = body;

    // Check if goal belongs to user
    const existingGoal = await getDocument(COLLECTIONS.GOALS, id);
    if (!existingGoal || (existingGoal as any).userId !== authUser.uid) {
      return errorResponse('Goal not found', 404);
    }

    const updateData: any = {};
    if (currentValue !== undefined) {
      updateData.currentValue = currentValue;
      
      // Calculate progress
      const targetValue = (existingGoal as any).targetValue;
      updateData.progress = Math.min(Math.round((currentValue / targetValue) * 100), 100);
      
      // Auto-complete if progress reaches 100%
      if (updateData.progress >= 100) {
        updateData.status = 'completed';
      } else if ((existingGoal as any).status === 'completed' && updateData.progress < 100) {
        // Reactivate if was completed but now below 100%
        updateData.status = 'active';
      }
    }

    await updateDocument(COLLECTIONS.GOALS, id, updateData);

    const updatedGoal = await getDocument(COLLECTIONS.GOALS, id);

    return successResponse(updatedGoal, 'Goal progress updated successfully');
  } catch (error: any) {
    console.error('Update goal progress error:', error);
    return errorResponse(error.message || 'Failed to update goal progress', 500);
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

    // Check if goal belongs to user
    const existingGoal = await getDocument(COLLECTIONS.GOALS, id);
    if (!existingGoal || (existingGoal as any).userId !== authUser.uid) {
      return errorResponse('Goal not found', 404);
    }

    await deleteDocument(COLLECTIONS.GOALS, id);

    return successResponse(null, 'Goal deleted successfully');
  } catch (error: any) {
    console.error('Delete goal error:', error);
    return errorResponse(error.message || 'Failed to delete goal', 500);
  }
}
