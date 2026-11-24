import type { Review } from "./types";

// Base URL of the backend. Set VITE_API_URL in .env (local) or in Vercel settings (deployed).
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);

  return data;
};

export async function getFollowingReviews(): Promise<Review[]> {
  return request<Review[]>('/api/following/reviews');
}
