import { useEffect, useState } from 'react'
import { getFollowing, getFollowingReviews } from '@/api'
import type { Review, User } from '@/types'
import { FollowingCard } from '@/components/following-card'
import { Button } from '@/components/ui/button'
import { ReviewCard } from '@/components/review-card'

export default function Home() {
  const [following, setFollowing] = useState<User[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    Promise.all([getFollowing(), getFollowingReviews()])
      .then(([users, feed]) => {
        if (!active) return
        setFollowing(users)
        setReviews(feed)
      })
      .catch((error: unknown) => {
        if (active) setError(error instanceof Error ? error.message : 'Unable to load your feed.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [attempt])

  if (loading) return <p role="status" className="text-sm text-muted-foreground">Loading your following feed…</p>
  if (error) return (
    <div role="alert" className="space-y-3 rounded-xl border p-6">
      <p className="text-sm text-destructive">{error}</p>
      <Button variant="outline" onClick={() => {
        setLoading(true)
        setError(null)
        setAttempt((value) => value + 1)
      }}>Try again</Button>
    </div>
  )

  const authors = new Map(following.map((user) => [user.user_id, user]))

  return (
    <div className="grid items-start gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
      <aside aria-label="People you follow" className="md:sticky md:top-6">
        <FollowingCard users={following} />
      </aside>
      <section aria-labelledby="feed-title" className="min-w-0 space-y-5">
        <div>
          <h1 id="feed-title" className="m-0 text-2xl font-semibold tracking-tight">Following reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">The latest reviews from people you follow. Newest first.</p>
        </div>
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.review_id}><ReviewCard review={review} author={authors.get(review.user_id)} /></li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No reviews yet. Reviews from people you follow will appear here.
          </div>
        )}
      </section>
    </div>
  )
}
