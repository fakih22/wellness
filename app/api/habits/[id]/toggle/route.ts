import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { COLLECTIONS, getDb } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay, calculateStreak } from '@/src/lib/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    
    // Parse body safely - handle empty body
    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // If body is empty or invalid, use empty object
      body = {};
    }
    
    const { date } = body;

    const targetDate = date ? getStartOfDay(new Date(date)) : getStartOfDay();

    // Get habit using Admin SDK
    const db = getDb();
    const habitDoc = await db.collection(COLLECTIONS.HABITS).doc(id).get();

    if (!habitDoc.exists) {
      return errorResponse('Habit not found', 404);
    }

    const habit = habitDoc.data();
    if (!habit || habit.userId !== authUser.uid) {
      return errorResponse('Habit not found', 404);
    }

    // Convert Firestore Timestamps to Dates
    const completedDates = (habit.completedDates || []).map((d: any) => {
      if (d && d._seconds) {
        return new Date(d._seconds * 1000);
      } else if (d && d.seconds) {
        return new Date(d.seconds * 1000);
      } else if (d && d.toDate) {
        return d.toDate();
      }
      return new Date(d);
    });

    // Check if date already exists
    const dateExists = completedDates.some(
      (d: Date) => getStartOfDay(d).getTime() === targetDate.getTime()
    );

    let updatedCompletedDates;

    if (dateExists) {
      // Remove date (uncheck)
      updatedCompletedDates = completedDates.filter(
        (d: Date) => getStartOfDay(d).getTime() !== targetDate.getTime()
      );
    } else {
      // Add date (check)
      updatedCompletedDates = [...completedDates, targetDate];
    }

    // Convert dates to Firestore Timestamps
    const firestoreTimestamps = updatedCompletedDates.map((d: Date) => 
      Timestamp.fromDate(d)
    );

    // Recalculate streak
    const newStreak = calculateStreak(updatedCompletedDates);
    const newBestStreak = Math.max(newStreak, habit.bestStreak || 0);

    // Update using Admin SDK
    await db.collection(COLLECTIONS.HABITS).doc(id).update({
      completedDates: firestoreTimestamps,
      streak: newStreak,
      bestStreak: newBestStreak,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Get updated habit
    const updatedDoc = await db.collection(COLLECTIONS.HABITS).doc(id).get();
    const updatedHabit = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return successResponse(updatedHabit, 'Habit toggled successfully');
  } catch (error: any) {
    console.error('Toggle habit error:', error);
    return errorResponse(error.message || 'Failed to toggle habit', 500);
  }
}
