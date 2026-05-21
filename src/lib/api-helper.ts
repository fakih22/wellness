import { authService } from '@/src/services/authService';

/**
 * Fetch wrapper with automatic token refresh on 401/expired errors
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Get current token
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Add auth header
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // First attempt
  let response = await fetch(url, { ...options, headers });

  // If unauthorized or token expired, try to refresh token and retry
  if (response.status === 401 || response.status === 403) {
    try {
      const errorData = await response.clone().json();
      
      // Check if it's a token expiration error
      if (
        errorData.message?.includes('expired') || 
        errorData.message?.includes('token') ||
        errorData.code === 'auth/id-token-expired'
      ) {
        console.log('Token expired, refreshing...');
        
        // Try to get fresh token
        const freshToken = await authService.getFreshToken();
        
        if (freshToken) {
          // Retry with fresh token
          const newHeaders = {
            ...options.headers,
            'Authorization': `Bearer ${freshToken}`,
          };
          
          response = await fetch(url, { ...options, headers: newHeaders });
          console.log('Request retried with fresh token');
        } else {
          // Can't refresh token, redirect to login
          console.error('Cannot refresh token, redirecting to login');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
      }
    } catch (error) {
      console.error('Error handling token refresh:', error);
    }
  }

  return response;
}

/**
 * Convenience wrapper for JSON responses
 */
export async function fetchJsonWithAuth<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, options);
  return response.json();
}
