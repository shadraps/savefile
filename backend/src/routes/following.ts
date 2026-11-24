import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('reviews', (req : Request, res : Response) => {
  res.json({ message: 'This is a placeholder for the /api/following/reviews endpoint.' });
});

export default router;