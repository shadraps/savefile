import { Router, type Request, type Response } from 'express'
import { supabase } from '../supabase.ts'

const router = Router()

// POST /users
router.post('/', async (req: Request, res: Response) => {
  const { username, displayName } = req.body

  await supabase.from('users').insert({ username: username, display_name: displayName }).then(({ error }) => {
    if (error) return res.status(500).json({ error: error.message })

    return res.status(201).json({ message: 'User created successfully' })
  })
})

// `GET /users/:username` endpoint.
router.get('/:username', async (req: Request, res: Response) => {
  const username = String(req.params.username)

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle()
  
  if (userError) return res.status(500).json({ error: userError.message })

  // Return 404 if user doesn't exist.
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Get all the user's reviews, their following count, and their follower count.
  const [reviewsResult, followingResult, followersResult] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .order('review_id', { ascending: false }),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.user_id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.user_id),
  ])

  const error = reviewsResult.error ?? followingResult.error ?? followersResult.error
  if (error) return res.status(500).json({ error: error.message })

  return res.json({
    user: user,
    reviews: reviewsResult.data ?? [],
    followingCount: followingResult.count ?? 0,
    followerCount: followersResult.count ?? 0,
  })
})

export default router
