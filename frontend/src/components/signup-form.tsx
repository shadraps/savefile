import { useState, type SubmitEvent, type ComponentProps } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function SignupForm(props: ComponentProps<typeof Card>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const values = new FormData(event.currentTarget)
    const password = String(values.get('password'))
    setError(null)
    if (password !== values.get('confirm-password')) {
      setError('Passwords do not match.')
      return
    }
    setPending(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: String(values.get('email')).trim(),
        password,
        options: { data: { full_name: String(values.get('name')).trim() } },
      })

      if (error) setError(error.message)
    } catch {
      setError('Unable to create an account. Please check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle><span role="heading" aria-level={1}>Create an account</span></CardTitle>
        <CardDescription>Enter your information below to create your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} aria-busy={pending}>
          <fieldset disabled={pending} className="min-w-0">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
                <Input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Your name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} aria-describedby="password-hint" required />
                <FieldDescription id="password-hint">Must be at least 8 characters long.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Field>
                <Button type="submit" disabled={pending}>{pending ? 'Creating account...' : 'Create account'}</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Log in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}
