import { useState } from 'react'
import { Gamepad2, LogOut, Search } from 'lucide-react'
import { Link } from 'react-router'
import { supabase } from '../supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'

type HeaderProps = {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          />
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
