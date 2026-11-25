import { useState } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router/internal/react-server-client'

export default async function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
    })

    if (error) {
        console.error('Error signing up:', error.message)
    }

    return (
        <Link to="/login">
            Already have an account? Log in!
        </Link>
    )
}