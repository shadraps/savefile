import type { User } from '@supabase/supabase-js'
import { Router, type Response } from 'express'
import { supabase } from '../supabase.ts'

const router = Router()

async function getFollowingUsers(res: Response) {
  const user: User = res.locals.user

  const username = user.user_metadata.username

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('user_id')
    .eq('username', username)
    .maybeSingle()

  if (profileError) {
    res.status(500).json({ error: profileError.message })
    return null
  }
  if (!profile) {
    res.status(404).json({ error: 'User profile not found.' })
    return null
  }

  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profile.user_id)

  if (followsError) {
    res.status(500).json({ error: followsError.message })
    return null
  }
  if (!follows?.length) return []

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('user_id', follows.map((follow) => follow.following_id))
    .order('display_name', { ascending: true })
    .order('username', { ascending: true })

  if (usersError) {
    res.status(500).json({ error: usersError.message })
    return null
  }

  return users ?? []
}

router.get('/', async (_req, res) => {
  const following = await getFollowingUsers(res)
  if (following === null) return
  return res.json({ following })
})

router.get('/reviews', async (_req, res) => {
  const following = await getFollowingUsers(res)
  if (following === null) return
  if (following.length === 0) return res.json({ reviews: [] })

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .in('user_id', following.map((user) => user.user_id))
    .order('created_at', { ascending: false })
    .order('review_id', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  return res.json({ reviews: reviews ?? [] })
})

export default router
