import { useState, type SubmitEvent, type ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { supabase } from '@/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function LoginForm({ className, ...props }: ComponentProps<'div'>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (pending) return
    
    const values = new FormData(event.currentTarget)
    
    setError(null)
    setPending(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(values.get('email')).trim(),
        password: String(values.get('password')),
      })
      
      if (error) setError(error.message)
    } catch {
      setError('Unable to log in. Please check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle><span role="heading" aria-level={1}>Log in to your account</span></CardTitle>
          <CardDescription>Enter your email and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} aria-busy={pending}>
            <fieldset disabled={pending} className="min-w-0">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
                </Field>
                {error && <FieldError>{error}</FieldError>}
                <Field>
                  <Button type="submit" disabled={pending}>{pending ? 'Logging in...' : 'Log in'}</Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
