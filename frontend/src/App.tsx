import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import Home from './pages/home';
import SignUp from './pages/signup';
import Login from './pages/login';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={session ? <Home /> : <Navigate to="/login" replace />}
      />
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
