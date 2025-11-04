import { Router } from 'express';

const router = Router();

// Minimal upcoming exams router placeholder
router.get('/', (req, res) => {
  res.json({ ok: true, route: 'upcomingexams', items: [] });
});

export default router;
