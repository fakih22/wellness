import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/src/lib/auth';
import { getDocument, updateDocument, COLLECTIONS } from '@/src/lib/firestore-admin';
import { successResponse, errorResponse, generateAvatarInitial } from '@/src/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await getDocument(COLLECTIONS.USERS, authUser.uid);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const userData = {
      uid: (user as any).uid,
      name: (user as any).name,
      email: (user as any).email,
      age: (user as any).age,
      gender: (user as any).gender,
      height: (user as any).height,
      weight: (user as any).weight,
      avatarInitial: (user as any).avatarInitial,
    };

    return successResponse(userData);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse(error.message || 'Failed to get profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, age, gender, height, weight } = body;

    // Validation
    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.avatarInitial = generateAvatarInitial(name);
    }
    if (age !== undefined) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;

    await updateDocument(COLLECTIONS.USERS, authUser.uid, updateData);

    const user = await getDocument(COLLECTIONS.USERS, authUser.uid);

    return successResponse(user, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', error);
    return errorResponse(error.message || 'Failed to update profile', 500);
  }
}
