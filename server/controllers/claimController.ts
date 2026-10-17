import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  createVerifiedClaim,
  getUserClaims,
  getClaimById
} from '../services/claimService';

export async function submitClaim(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required to submit an allocation claim.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const { vehicleId, deliveryAddress } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await createVerifiedClaim(
      { vehicleId, deliveryAddress },
      req.user,
      { ipAddress, userAgent }
    );

    res.status(201).json({
      success: true,
      data: result.claim,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyClaims(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to view your claims.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const claims = await getUserClaims(req.user.id);
    res.json({
      success: true,
      data: claims,
      count: claims.length
    });
  } catch (err) {
    next(err);
  }
}

export async function getClaimDetails(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to view claim details.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const { id } = req.params;
    const details = await getClaimById(id, req.user);

    res.json({
      success: true,
      data: details.claim,
      history: details.history
    });
  } catch (err) {
    next(err);
  }
}
