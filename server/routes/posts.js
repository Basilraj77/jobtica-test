import { Router } from 'express';

const router = Router();

// Minimal posts router placeholder
router.get('/', (req, res) => {
  res.json({ ok: true, route: 'posts', items: [] });
});

export default router;
