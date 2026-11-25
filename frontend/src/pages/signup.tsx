import { useState } from 'react'
import { supabase } from '../supabase'

type SignUpProps = {
    onLoginClick: () => void
}

export default async function SignUp({ onLoginClick }: SignUpProps) {
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
        <button type="button" onClick={onLoginClick}>
            Already have an account? Log in!
        </button>
    )
}