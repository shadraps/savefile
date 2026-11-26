import { LoginForm } from '@/components/login-form'

export default function Login() {
  return (
    <main className="auth-page flex min-h-svh w-full items-center justify-center bg-muted p-6 text-foreground md:p-10">
      <div className="w-full max-w-sm"><LoginForm /></div>
    </main>
  )
}
