import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { User } from '../types'

export function UserInitials({ user }: { user: User }) {
  const initials = user.display_name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('')
  return (
    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {initials}
    </span>
  )
}

export function FollowingCard({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase()
  const visibleUsers = users.filter((user) =>
    `${user.display_name} ${user.username}`.toLocaleLowerCase().includes(search),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="m-0 flex items-center gap-2 text-base font-semibold">
            <Users className="size-4 text-muted-foreground" aria-hidden="true" />
            Following
            <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{users.length}</span>
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Search people you follow" placeholder="Search following…"
            value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
        </div>
        <div aria-live="polite">
          {visibleUsers.length > 0 ? (
            <ul className="max-h-72 divide-y overflow-y-auto md:max-h-[60svh]">
              {visibleUsers.map((user) => (
                <li key={user.user_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <UserInitials user={user} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.display_name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              {users.length === 0 ? 'People you follow will appear here.' : 'No people match your search.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
