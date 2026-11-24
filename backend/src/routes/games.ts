import { Router, type Request, type Response } from 'express';
import { RAWG_BASE_URL, RAWG_API_KEY } from '../index.ts';
const router = Router();

// GET /games/:game
router.get("/:game", async (req : Request, res : Response) => {
    const game = String(req.params.game);

    const url = new URL(`${RAWG_BASE_URL}${encodeURIComponent(game)}`);
    url.searchParams.set('key', RAWG_API_KEY as string);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: `Failed to fetch game data: ${response.statusText}` });
        }

        return res.json(await response.json());
    } catch (error) {
        return res.status(502).json({ error: "Could not reach RAWG" });
    }
});

export default router;
