import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../supabase'


export default async function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
    
  const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
  })

  if (error) {
      console.error('Error signing in:', error.message)
  }

  return (
    <Link to="/signUp">
      Don't have an account? Sign up here!
    </Link>
  )
}