import { ApiResponse, LoginCredentials, SignupData, TokenResponse } from './types';

const BASE_URL = '/api';

/**
 * A generic fetch wrapper for making API calls.
 * It automatically adds the Authorization header if a token exists.
 * It expects the API to return a standard ApiResponse format.
 * @param url The URL path (e.g., '/auth/login')
 * @param options The standard fetch options
 * @returns The `data` property of the API response.
 * @throws An error with the message from the API if the request fails.
 */
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  // Handle No Content response
  if (response.status === 204) {
    return null as T;
  }

  const responseData: ApiResponse<T> = await response.json();

  if (!response.ok) {
    const errorMessage = responseData.error?.message || `API request to ${url} failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (responseData.error) {
    throw new Error(responseData.error.message);
  }

  return responseData.data as T;
}

// =================================================================
// Authentication API Calls
// =================================================================

/**
 * Calls the login API endpoint.
 * @param credentials The user's email and password.
 * @returns A promise that resolves with the token response.
 */
export const login = (credentials: LoginCredentials): Promise<TokenResponse> => {
  return fetchApi<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

/**
 * Calls the signup API endpoint.
 * @param signupData The new user's email, password, and username.
 * @returns A promise that resolves when the signup is successful.
 */
export const signup = (signupData: SignupData): Promise<void> => {
  return fetchApi<void>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signupData),
  });
};

// =================================================================
// Gym API Calls
// =================================================================

import { Gym, VideoPost } from './types';

/**
 * Fetches a list of featured gyms.
 * @returns A promise that resolves with an array of Gym objects.
 */
export const fetchFeaturedGyms = (): Promise<Gym[]> => {
  // The backend response for a list is likely wrapped in the ApiResponse format.
  // The fetchApi function handles unwrapping the `data` property.
  return fetchApi<Gym[]>('/gyms?featured=true&limit=6');
};

/**
 * Toggles a bookmark on a gym for the current user.
 * @param gymId The ID of the gym to bookmark/unbookmark.
 * @returns A promise that resolves when the action is complete.
 */
export const toggleGymBookmark = (gymId: string): Promise<void> => {
  return fetchApi<void>(`/gyms/${gymId}/bookmark`, {
    method: 'POST',
  });
};

// =================================================================
// Video API Calls
// =================================================================

/**
 * Fetches a paginated list of recommended videos.
 * @param page The page number to fetch.
 * @returns A promise that resolves with an object containing the videos and a flag indicating if there are more.
 */
export const fetchRecommendedVideos = (page: number): Promise<{ videos: VideoPost[], hasMore: boolean }> => {
  // This endpoint might return a different structure (e.g., with pagination metadata)
  // For now, we assume fetchApi can handle it and we might need to adjust later.
  // The logic in HomePage was returning response.data, which we assume is the object we need.
  return fetchApi<{ videos: VideoPost[], hasMore: boolean }>(`/videos?recommended=true&page=${page}&limit=8`);
};
