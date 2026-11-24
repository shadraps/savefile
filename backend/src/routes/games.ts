import { Router, type Request, type Response } from 'express';
import { supabase } from '../supabase.ts';

const router = Router();

// GET /games/:game
router.get("/:game", async (req : Request, res : Response) => {
    const { game } = req.params;
});

export default router;