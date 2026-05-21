import { auth } from './firebase';

export async function apiClient(url: string, options: RequestInit = {}) {
  try {
    // Get current user token
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge additional headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Client Error:', error);
    throw error;
  }
}

// Helper methods
export const api = {
  get: (url: string) => apiClient(url, { method: 'GET' }),
  
  post: (url: string, body: any) => 
    apiClient(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: (url: string, body: any) => 
    apiClient(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  patch: (url: string, body: any) => 
    apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  
  delete: (url: string) => 
    apiClient(url, { method: 'DELETE' }),
};
