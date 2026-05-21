import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { successResponse, errorResponse } from '@/src/lib/helpers';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    // Use Firebase Admin SDK for server-side Firestore access
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(authUser.uid).get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    const userData = userDoc.data();

    // Remove sensitive data if any
    const userResponse = {
      uid: userData?.uid,
      name: userData?.name,
      email: userData?.email,
      age: userData?.age,
      gender: userData?.gender,
      height: userData?.height,
      weight: userData?.weight,
      avatarInitial: userData?.avatarInitial,
    };

    return successResponse(userResponse);
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse(error.message || 'Failed to get user', 500);
  }
}
