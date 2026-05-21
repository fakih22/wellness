import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getDocument, updateDocument, deleteDocument, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse } from '@/src/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const journal = await getDocument(COLLECTIONS.JOURNALS, id);

    if (!journal || (journal as any).userId !== authUser.uid) {
      return errorResponse('Journal not found', 404);
    }

    return successResponse(journal);
  } catch (error: any) {
    console.error('Get journal error:', error);
    return errorResponse(error.message || 'Failed to get journal', 500);
  }
}

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
    const { title, content, mood, tags } = body;

    // Check if journal belongs to user
    const existingJournal = await getDocument(COLLECTIONS.JOURNALS, id);
    if (!existingJournal || (existingJournal as any).userId !== authUser.uid) {
      return errorResponse('Journal not found', 404);
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (mood !== undefined) updateData.mood = mood;
    if (tags !== undefined) updateData.tags = tags;

    await updateDocument(COLLECTIONS.JOURNALS, id, updateData);

    const updatedJournal = await getDocument(COLLECTIONS.JOURNALS, id);

    return successResponse(updatedJournal, 'Journal updated successfully');
  } catch (error: any) {
    console.error('Update journal error:', error);
    return errorResponse(error.message || 'Failed to update journal', 500);
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

    // Check if journal belongs to user
    const existingJournal = await getDocument(COLLECTIONS.JOURNALS, id);
    if (!existingJournal || (existingJournal as any).userId !== authUser.uid) {
      return errorResponse('Journal not found', 404);
    }

    await deleteDocument(COLLECTIONS.JOURNALS, id);

    return successResponse(null, 'Journal deleted successfully');
  } catch (error: any) {
    console.error('Delete journal error:', error);
    return errorResponse(error.message || 'Failed to delete journal', 500);
  }
}
