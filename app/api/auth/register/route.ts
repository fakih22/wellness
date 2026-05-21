import { NextRequest } from 'next/server';
import { successResponse, errorResponse, generateAvatarInitial } from '@/src/lib/helpers';
import { getUserFromRequest } from '@/src/lib/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from token
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, age, gender, height, weight } = body;

    // Validation
    if (!name || !email) {
      return errorResponse('Name and email are required');
    }

    // Generate avatar initial from name
    const avatarInitial = generateAvatarInitial(name);

    // Create user profile in Firestore using Admin SDK
    const db = getFirestore();
    await db.collection('users').doc(authUser.uid).set({
      uid: authUser.uid,
      name,
      email: email.toLowerCase(),
      age: age || null,
      gender: gender || null,
      height: height || null,
      weight: weight || null,
      avatarInitial,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return user data
    const userData = {
      uid: authUser.uid,
      name,
      email: email.toLowerCase(),
      age: age || null,
      gender: gender || null,
      height: height || null,
      weight: weight || null,
      avatarInitial,
    };

    return successResponse(
      { user: userData },
      'Registration successful'
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'Registration failed', 500);
  }
}
