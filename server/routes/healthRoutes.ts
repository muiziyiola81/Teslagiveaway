import { Router } from 'express';
import { getHealth, getReadiness } from '../controllers/healthController';

const router = Router();

// Liveness probe
router.get('/health', getHealth);

// Readiness probe
router.get('/ready', getReadiness);

export default router;
