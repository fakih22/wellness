import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/src/lib/helpers';

// This route is deprecated - login now happens client-side with Firebase Auth
// Keeping it for backward compatibility
export async function POST(request: NextRequest) {
  return errorResponse('Please use client-side Firebase Authentication', 400);
}
