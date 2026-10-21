import { Router } from 'express';
import {
  submitClaim,
  listMyClaims,
  getClaimDetails,
  submitPaymentEvidence
} from '../controllers/claimController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { claimSubmissionSchema, paymentEvidenceSchema } from '../validation';
import { sensitiveEndpointLimiter } from '../middleware/rateLimiter';

const router = Router();

// All claim operations require authenticating the applicant
router.use(authenticateToken);

router.post(
  '/',
  sensitiveEndpointLimiter,
  validateBody(claimSubmissionSchema),
  submitClaim
);

router.get('/my-claims', listMyClaims);
router.get('/:id', getClaimDetails);
router.post(
  '/:id/payment-evidence',
  sensitiveEndpointLimiter,
  validateBody(paymentEvidenceSchema),
  submitPaymentEvidence
);

export default router;
