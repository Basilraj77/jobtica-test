import { Router } from 'express';

const router = Router();

// Minimal system router placeholder
router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

export default router;
