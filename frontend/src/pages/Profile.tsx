import { useState, useEffect } from "react";
import { getProfile } from "@/api";
import type { Review, User } from "@/types";
import { ReviewCard } from "@/components/review-card";
import { Card, CardContent } from "@/components/ui/card";


export default function Profile({ username }: {username: string}) {
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [followingCount, setFollowingCount] = useState<number>(0)
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore: boolean = false

    setLoading(true)
    setError(null)

    getProfile(username)
      .then((profile) => {
        if (ignore) return

        setUser(profile.user)
        setReviews(profile.reviews)
        setFollowingCount(profile.followingCount)
        setFollowerCount(profile.followerCount)
      })
      .catch((error: unknown) => {
        if (ignore) return

        setError(error instanceof Error ? error.message : 'Unable to load profile')
      })
      .finally(() => {
        if (ignore) return

        setLoading(false)
      })

    // Cleanup function.
    return () => {
      ignore = true
    }
  }, [username])

  if (loading) return <p role="status">Loading profile…</p>
  if (error) return <p role="alert">{error}</p>
  if (!user) return null

  return (
    <section aria-label={`${user.display_name}'s profile`} className="mx-auto w-full max-w-2xl space-y-8">
      <Card>
        <CardContent className="gap-6">
          <header className="min-w-0 space-y-1">
            <h1 className="break-words text-3xl font-semibold tracking-tight">{user.display_name}</h1>
            <p className="break-words text-base text-muted-foreground">@{user.username}</p>
          </header>
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-baseline gap-2">
              <dt className="text-muted-foreground">Following</dt>
              <dd className="font-semibold tabular-nums">{followingCount}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-muted-foreground">Followers</dt>
              <dd className="font-semibold tabular-nums">{followerCount}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section aria-label="Reviews">
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.review_id}><ReviewCard review={review} author={user} /></li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No reviews yet.
          </div>
        )}
      </section>
    </section>
  )
}
