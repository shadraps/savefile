import 'dotenv/config'
import cors from 'cors'
import { supabase } from './supabase.ts'
import express from 'express'
import { type Request, type Response } from 'express'
import gamesRouter from './routes/games.ts'
import followingRouter from './routes/following.ts'
import usersRouter from './routes/users.ts'

const app = express()
const PORT = process.env.PORT || 3000

export const RAWG_BASE_URL = 'https://api.rawg.io/api/games'
export const RAWG_API_KEY = process.env.RAWG_API_KEY

// CORS: comma-separated list of allowed frontend origins
// e.g. CORS_ORIGIN=http://localhost:5173,https://my-app.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/following', followingRouter)

app.use('/api/games', gamesRouter)

app.use('/api/users', usersRouter)

// 404 for any other routes not handled by the API.
app.use((req : Request, res : Response) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
