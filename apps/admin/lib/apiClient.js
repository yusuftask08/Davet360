import { createApiClient } from '@repo/api-client';

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
});
