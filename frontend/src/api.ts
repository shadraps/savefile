import { supabase } from "./supabase"
import type { Review } from "./types"

// Base URL of the backend. Set VITE_API_URL in .env (local) or in Vercel settings (deployed).
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  
  if (session) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)

  return data
}

export async function getFollowingReviews(): Promise<Review[]> {
  return await request<Review[]>('/api/following/reviews')
}

export async function createUser(username: string, displayName: string): Promise<void> {
  await request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username, displayName }),
  })
}
