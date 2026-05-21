/**
 * API Fetch Wrapper with Auto Token Refresh
 * Automatically refreshes expired tokens and retries requests
 */

import { auth } from './firebase';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch wrapper that handles token refresh automatically
 */
export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;

  // Get token from localStorage
  let token = localStorage.getItem('token');

  // Add Authorization header if not skipping auth
  if (!skipAuth && token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Make initial request
  let response = await fetch(url, fetchOptions);

  // If 401 and we have auth, try to refresh token
  if (response.status === 401 && !skipAuth && auth.currentUser) {
    console.log('Token expired, refreshing...');

    try {
      // Get fresh token from Firebase
      const freshToken = await auth.currentUser.getIdToken(true);
      
      // Update stored token
      localStorage.setItem('token', freshToken);
      
      // Update cookie
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `firebase-token=${freshToken}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;

      // Update cookie via API
      try {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: freshToken }),
        });
      } catch (error) {
        console.error('Failed to update cookie via API:', error);
      }

      // Retry original request with new token
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${freshToken}`,
      };

      response = await fetch(url, fetchOptions);
      console.log('Request retried with fresh token');
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

/**
 * Convenience methods
 */
export const apiClient = {
  async get(url: string, options: FetchOptions = {}) {
    return apiFetch(url, { ...options, method: 'GET' });
  },

  async post(url: string, data?: any, options: FetchOptions = {}) {
    return apiFetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(url: string, data?: any, options: FetchOptions = {}) {
    return apiFetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(url: string, options: FetchOptions = {}) {
    return apiFetch(url, { ...options, method: 'DELETE' });
  },
};
