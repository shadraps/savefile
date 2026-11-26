import 'dotenv/config'
import cors from 'cors'
import { supabase } from './supabase.ts'
import express, { type NextFunction } from 'express'
import { type Request, type Response } from 'express'
import gamesRouter from './routes/games.ts'
import followingRouter from './routes/following.ts'
import usersRouter from './routes/users.ts'
import type { User } from '@supabase/supabase-js'

const app = express()
const PORT = process.env.PORT || 3000

export const RAWG_BASE_URL = 'https://api.rawg.io/api/games'
export const RAWG_API_KEY = process.env.RAWG_API_KEY

// CORS: comma-separated list of allowed frontend origins
// e.g. CORS_ORIGIN=http://localhost:5173,https://my-app.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
export async function requireAuth(
  req: Request,
  res: Response<unknown, { user: User }>,
  next: NextFunction,
) {
  const authorization = req.get('Authorization')
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)

  if (!match) {
    res.status(401).json({ error: 'Login required.' })
    return
  }

  const token = match[1]

  try {
    const { data: { user }, error } =
      await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired access token.' });
      return;
    }

    res.locals.user = user;
  } catch (error) {
    next(error);
    return;
  }

  next();
}

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/following', requireAuth, followingRouter)

app.use('/api/games', gamesRouter)

app.use('/api/users', usersRouter)

// 404 for any other routes not handled by the API.
app.use((req : Request, res : Response) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
