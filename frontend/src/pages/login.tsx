import { useState } from 'react'
import { supabase } from '../supabase'

type LoginProps = {
    onSignUpClick: () => void
}

export default async function Login({ onSignUpClick }: LoginProps) {
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
        <button type="button" onClick={onSignUpClick}>
            Don't have an account? Sign up here!
        </button>
    )
}