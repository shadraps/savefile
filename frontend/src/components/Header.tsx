import { useEffect, useState } from 'react'
import { Gamepad2, LogOut, Search } from 'lucide-react'
import { Link } from 'react-router'
import { supabase } from '../supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getSearch } from '@/api'
import type { Game } from '@/types'

type HeaderProps = {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Game[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const search = query.trim()
    let ignore = false

    setResults([])

    if (!search) return

    getSearch(search)
      .then((games) => { if (!ignore) setResults(games) })
      .catch(()=> { if (!ignore) setResults([]) })

    return () => { ignore = true }
  }, [query])

  async function signOut() {
    setSigningOut(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error
    } catch {
      setError('Could not sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="size-5" aria-hidden="true" />
          </span>
          SaveFile
        </Link>

        <form
          role="search"
          className="relative order-last w-full sm:order-none sm:mx-auto sm:max-w-md sm:flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch?.(query)
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            name="search"
            aria-label="Search games"
            placeholder="Search games…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            onFocus={() => setSearchOpen(true)}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false) }}
            onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }}
          />

          {searchOpen && query.trim() && results.length > 0 && (
            <ul
              aria-label="Game search results"
              className="absolute inset-x-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-lg">
              {results.map((game, index) => (
                <li key={game.id ?? index}>
                  <button
                    type="button"
                    className="w-full rounded-sm px-3 py-2 text-left hover:bg-accent focus-visible:bg-accent"
                    onClick={() => {
                      setQuery(game.name ?? '')
                      setSearchOpen(false)
                      onSearch?.(game.name ?? '')
                    }}
                  >
                    {game.name ?? 'Untitled Game'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <Button variant="ghost" size="sm" onClick={signOut} disabled={signingOut}>
          <LogOut aria-hidden="true" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      {error && <p role="alert" className="px-4 pb-3 text-center text-sm text-destructive">{error}</p>}
    </header>
  )
}
