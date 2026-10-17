import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Strict role-based access control middleware for administration APIs.
 * Ensures the authenticated user possesses 'admin' or 'superadmin' rights.
 * Never trusts a client-supplied role flag.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required prior to accessing administrative resources.',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. User lacks administrative privileges.',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  next();
}
