import { api } from './api';
import type { ApiResponse, AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';

// Token refresh helper
let tokenRefreshPromise: Promise<string> | null = null;
let authListenerInitialized = false;

export const authService = {
  // Get fresh token (with auto refresh)
  async getFreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      // If there's already a refresh in progress, wait for it
      if (tokenRefreshPromise) {
        return await tokenRefreshPromise;
      }

      // Start token refresh
      tokenRefreshPromise = currentUser.getIdToken(true);
      const freshToken = await tokenRefreshPromise;
      tokenRefreshPromise = null;

      // Update stored token
      localStorage.setItem('token', freshToken);
      
      // Update cookie
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (typeof document !== 'undefined') {
        document.cookie = `firebase-token=${freshToken}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      }

      return freshToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenRefreshPromise = null;
      return null;
    }
  },

  // Initialize auth state listener (only once)
  initAuthListener() {
    if (typeof window === 'undefined' || authListenerInitialized) return;
    
    authListenerInitialized = true;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, refresh token periodically
        try {
          const token = await user.getIdToken();
          localStorage.setItem('token', token);
          
          const isSecure = window.location.protocol === 'https:';
          document.cookie = `firebase-token=${token}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        } catch (error) {
          console.error('Error updating token:', error);
        }
      } else {
        // User is signed out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof document !== 'undefined') {
          document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
    });

    // Refresh token every 50 minutes (tokens expire after 1 hour)
    setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await this.getFreshToken();
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Auto token refresh failed:', error);
        }
      }
    }, 50 * 60 * 1000); // 50 minutes
  },
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      // Create user with Firebase Auth (client-side)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Create user profile in Firestore via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // IMPORTANT: Sign out after registration
        // User needs to login again from login page
        await signOut(auth);
        
        // Clear any stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return {
          success: true,
          message: 'Registration successful! Please login.',
          data: {
            user: result.data.user,
            token: '', // No token, user must login
          },
        };
      }

      throw new Error(result.message || 'Registration failed');
    } catch (error: any) {
      // Handle Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already registered');
      }
      throw error;
    }
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      // Sign in with Firebase Auth (client-side)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Get fresh ID token
      const idToken = await userCredential.user.getIdToken(true);

      // Get user profile from Firestore via API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem('token', idToken);
        localStorage.setItem('user', JSON.stringify(result.data));
        
        // Set cookie via API to ensure it's properly set for middleware
        try {
          const cookieResponse = await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: idToken }),
          });
          
          if (!cookieResponse.ok) {
            console.error('Failed to set cookie via API');
          }
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
        
        // Also set cookie client-side as backup
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `firebase-token=${idToken}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        
        // Initialize auth listener for auto token refresh
        this.initAuthListener();
        
        return {
          success: true,
          data: {
            user: result.data,
            token: idToken,
          },
        };
      }

      throw new Error(result.message || 'Login failed');
    } catch (error: any) {
      // Handle Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  },

  async getMe(): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>('/api/auth/me');
  },

  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Remove cookie
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if Firebase signOut fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
