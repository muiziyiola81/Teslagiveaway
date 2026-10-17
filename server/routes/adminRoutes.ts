import { Router } from 'express';
import {
  getAllClaims,
  adminUpdateClaimStatus,
  getAuditLogs,
  syncInventory
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { validateBody } from '../middleware/validate';
import { claimStatusUpdateSchema } from '../validation';

const router = Router();

// Enforce both authentication and administrator role for all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/claims', getAllClaims);
router.patch('/claims/:id/status', validateBody(claimStatusUpdateSchema), adminUpdateClaimStatus);
router.get('/audit-logs', getAuditLogs);
router.post('/sync-inventory', syncInventory);

export default router;
