import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import Home from './pages/home';
import SignUp from './pages/signup';
import Login from './pages/login';
import './App.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState<'login' | 'signUp'>('login');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (!nextSession) {
        setAuthPage('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <>Loading...</>;
  }

  if (session) {
    return <Home />;
  }

  if (authPage === 'signUp') {
    return <SignUp onLoginClick={() => setAuthPage('login')} />;
  }

  return <Login onSignUpClick={() => setAuthPage('signUp')} />;
};
