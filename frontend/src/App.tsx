import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Layout from './pages/Layout'
import Profile from './pages/Profile'

function ProfileRoute() {
  const { username } = useParams<{ username: string }>()

  if (!username) return <Navigate to="/" replace />

  return <Profile key={username} username={username} />
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <>Loading...</>
  }

  return (
    <Routes>
      <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Home />} />
        <Route path="/users/:username?" element={<ProfileRoute />} />
      </Route>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <SignUp />}
      />
    </Routes>
  )
}
