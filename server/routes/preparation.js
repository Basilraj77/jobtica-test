import { Router } from 'express';

const router = Router();

// Minimal preparation router placeholder
router.get('/', (req, res) => {
  res.json({ ok: true, route: 'preparation' });
});

export default router;
