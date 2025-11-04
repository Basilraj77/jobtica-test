import { Router } from 'express';

const router = Router();

// Minimal quicklinks router placeholder
router.get('/', (req, res) => {
  res.json({ ok: true, route: 'quicklinks', items: [] });
});

export default router;
