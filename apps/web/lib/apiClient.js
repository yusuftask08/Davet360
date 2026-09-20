import { createApiClient } from '@repo/api-client';

// Sunucu bileşenlerinde (public GET'ler) token yok, client bileşenlerinde localStorage'dan okunur.
export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
});
