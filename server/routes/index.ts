import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import claimRoutes from './claimRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Mount modules
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/claims', claimRoutes);
router.use('/admin', adminRoutes);

export default router;
