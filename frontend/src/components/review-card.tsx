import { Star } from 'lucide-react'
import { UserInitials } from '@/components/following-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Review, User } from '@/types'

const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export function ReviewCard({ review, author }: { review: Review; author?: User }) {
  const gameTitle = `Game #${review.rawg_game_id}`
  const authorName = author?.display_name ?? 'Unknown user'
  return (
    <article aria-label={`${authorName}'s review of ${gameTitle}`}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          {author && <UserInitials user={author} />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{authorName}</p>
            {author && <p className="truncate text-xs text-muted-foreground">@{author.username}</p>}
          </div>
          <time dateTime={review.created_at} className="shrink-0 text-xs text-muted-foreground">
            {dateFormatter.format(new Date(review.created_at))}
          </time>
        </CardHeader>
        <CardContent className="gap-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="m-0 text-base font-semibold">{gameTitle}</h2>
            <span aria-label={`Rated ${review.score} out of 10`} className="flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium">
              <Star className="size-3.5" aria-hidden="true" />
              {review.score}<span className="text-muted-foreground">/ 10</span>
            </span>
          </div>
          <p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{review.review}</p>
        </CardContent>
      </Card>
    </article>
  )
}
