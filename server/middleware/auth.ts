import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { getSupabaseAdmin, getSupabase } from '../db/supabase';
import { config } from '../config';

/**
 * Extracts Bearer token, verifies session against Supabase Auth,
 * and attaches verified user info + role to req.user.
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token missing or invalid format (Bearer token required).',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin() || getSupabase();

  if (!supabase) {
    res.status(503).json({
      error: {
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Authentication service is not configured. Please supply SUPABASE credentials in environment variables.',
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: error?.message || 'Authentication session has expired or is invalid.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const email = data.user.email || '';
    let role: UserRole = 'user';

    // Check if user is in hardcoded bootstrap admin list
    if (config.admin.authorizedEmails.includes(email.toLowerCase())) {
      role = 'superadmin';
    } else {
      // Query database user_roles table for verified administrative role
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleData?.role) {
          role = roleData.role as UserRole;
        }
      } catch {
        // Fallback default role
      }
    }

    req.user = {
      id: data.user.id,
      email,
      role,
      fullName: data.user.user_metadata?.full_name
    };

    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: {
        code: 'AUTH_VERIFICATION_ERROR',
        message: `Failed to verify authentication token: ${msg}`,
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Optional authentication middleware for endpoints that can be visited both
 * by guests and logged-in users (e.g. vehicle catalog or public claims status check).
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin() || getSupabase();
  if (!supabase) return next();

  try {
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) {
      const email = data.user.email || '';
      let role: UserRole = 'user';

      if (config.admin.authorizedEmails.includes(email.toLowerCase())) {
        role = 'superadmin';
      } else {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleData?.role) {
          role = roleData.role as UserRole;
        }
      }

      req.user = {
        id: data.user.id,
        email,
        role,
        fullName: data.user.user_metadata?.full_name
      };
    }
  } catch {
    // Proceed as unauthenticated guest
  }

  next();
}
