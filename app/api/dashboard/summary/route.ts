import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { queryDocuments, getOrCreateWaterLog, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, getStartOfDay } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const today = getStartOfDay();

    // Fetch all data in parallel using Firebase Admin SDK
    // Temporary: NO orderBy to avoid index issues - will add back once indexes fully propagate
    const [
      allUserMoods,
      todayWater,
      allUserSleep,
      allUserExercises,
      allUserHabits,
      allUserGoals,
      allUserAchievements,
    ] = await Promise.all([
      // Get all user moods (no orderBy)
      queryDocuments(
        COLLECTIONS.MOODS,
        [{ field: 'userId', operator: '==', value: authUser.uid }]
      ),
      
      // Today's water
      getOrCreateWaterLog(authUser.uid, today),
      
      // Get all user sleep logs (no orderBy)
      queryDocuments(
        COLLECTIONS.SLEEP_LOGS,
        [{ field: 'userId', operator: '==', value: authUser.uid }]
      ),
      
      // Get all user exercises (no orderBy)
      queryDocuments(
        COLLECTIONS.EXERCISE_LOGS,
        [{ field: 'userId', operator: '==', value: authUser.uid }]
      ),
      
      // Get active habits (no orderBy)
      queryDocuments(
        COLLECTIONS.HABITS,
        [
          { field: 'userId', operator: '==', value: authUser.uid },
          { field: 'isActive', operator: '==', value: true },
        ]
      ),
      
      // Get active goals (no orderBy)
      queryDocuments(
        COLLECTIONS.GOALS,
        [
          { field: 'userId', operator: '==', value: authUser.uid },
          { field: 'status', operator: '==', value: 'active' },
        ]
      ),
      
      // Get all user achievements (no orderBy)
      queryDocuments(
        COLLECTIONS.ACHIEVEMENTS,
        [{ field: 'userId', operator: '==', value: authUser.uid }]
      ),
    ]);

    // Sort and filter data client-side
    // Sort moods by createdAt desc
    const sortedMoods = allUserMoods.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Find today's mood
    const todayMood = sortedMoods.find((mood: any) => {
      const moodDate = mood.createdAt?.toDate ? mood.createdAt.toDate() : new Date(mood.createdAt);
      return getStartOfDay(moodDate).getTime() === today.getTime();
    }) || null;
    
    // Sort sleep logs and get latest
    const sortedSleep = allUserSleep.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    const latestSleep = sortedSleep.length > 0 ? sortedSleep[0] : null;

    // Filter exercises for today only
    const todayExercisesFiltered = allUserExercises.filter((exercise: any) => {
      const exerciseDate = exercise.createdAt?.toDate ? exercise.createdAt.toDate() : new Date(exercise.createdAt);
      return getStartOfDay(exerciseDate).getTime() === today.getTime();
    });

    // Sort habits by createdAt desc
    const sortedHabits = allUserHabits.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 10); // Take top 10

    // Sort goals by createdAt desc
    const sortedGoals = allUserGoals.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5); // Take top 5

    // Sort achievements by unlockedAt desc
    const sortedAchievements = allUserAchievements.sort((a: any, b: any) => {
      const dateA = a.unlockedAt?.toDate ? a.unlockedAt.toDate() : new Date(a.unlockedAt);
      const dateB = b.unlockedAt?.toDate ? b.unlockedAt.toDate() : new Date(b.unlockedAt);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5); // Take top 5

    // Calculate total streak from habits
    const totalStreak = sortedHabits.reduce((sum: number, habit: any) => sum + (habit.streak || 0), 0);

    // Calculate wellness score (simple algorithm)
    let wellnessScore = 0;
    if (todayMood) wellnessScore += 20;
    if (todayWater && (todayWater as any).amount >= 2) wellnessScore += 20;
    if (latestSleep && (latestSleep as any).totalHours >= 7) wellnessScore += 20;
    if (todayExercisesFiltered.length > 0) wellnessScore += 20;
    if (sortedHabits.length > 0) {
      const completedToday = sortedHabits.filter((h: any) => {
        if (!h.completedDates || h.completedDates.length === 0) return false;
        return h.completedDates.some((d: any) => {
          const date = d?.toDate ? d.toDate() : new Date(d);
          return getStartOfDay(date).getTime() === today.getTime();
        });
      }).length;
      wellnessScore += Math.min((completedToday / sortedHabits.length) * 20, 20);
    }

    const summary = {
      todayMood,
      todayWater: todayWater || { amount: 0, date: today },
      waterGoal: 2.5, // Default water goal
      latestSleep,
      todayExercises: todayExercisesFiltered,
      activeHabits: sortedHabits,
      activeGoals: sortedGoals,
      totalStreak,
      recentAchievements: sortedAchievements,
      wellnessScore: Math.round(wellnessScore),
    };

    return successResponse(summary);
  } catch (error: any) {
    console.error('Get dashboard summary error:', error);
    return errorResponse(error.message || 'Failed to get dashboard summary', 500);
  }
}
