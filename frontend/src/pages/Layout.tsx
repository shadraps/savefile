import { Outlet } from 'react-router'
import Header from '../components/Header'

export default function Layout() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
