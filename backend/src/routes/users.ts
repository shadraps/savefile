import { Router, type Request, type Response } from 'express'
import { supabase } from '../supabase.ts'

const router = Router()

router.post('/', (req: Request, res: Response) => {
  const { username, displayName } = req.body

  supabase.from('users').insert({ username: username, display_name: displayName }).then(({ error }) => {
    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ message: 'User created successfully' })
  })
})

export default router
