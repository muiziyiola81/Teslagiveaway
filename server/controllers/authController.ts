import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin, getSupabase } from '../db/supabase';
import { AuthenticatedRequest } from '../types';
import { recordAuditEvent } from '../services/auditService';

export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, phone, country } = req.body;
    const supabase = getSupabaseAdmin() || getSupabase();

    if (!supabase) {
      res.status(503).json({
        error: {
          code: 'AUTH_UNAVAILABLE',
          message: 'Supabase authentication service is not configured. Please supply environment variables.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Register with Supabase Auth
    const adminClient = getSupabaseAdmin();
    let authUser: any = null;
    let authSession: any = null;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          country
        }
      }
    });

    if (!authError && authData?.user) {
      authUser = authData.user;
      authSession = authData.session;
    } else {
      const isRateLimit = authError?.message?.toLowerCase().includes('rate limit');
      res.status(isRateLimit ? 429 : 400).json({
        error: {
          code: isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'REGISTRATION_FAILED',
          message: isRateLimit
            ? 'Email verification service rate limit exceeded. Please wait a few minutes before trying again.'
            : (authError?.message || 'Failed to create user account.'),
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Persist user profile in profiles table
    try {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        full_name: fullName,
        phone,
        country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[Profiles] Could not write initial profile:', e);
    }

    // Record audit event
    await recordAuditEvent({
      userId: authUser.id,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: authUser.id,
      ipAddress: req.ip,
      payload: { email }
    });

    res.status(201).json({
      success: true,
      message: authSession 
        ? 'Account created and authenticated successfully.' 
        : 'Account created successfully. Please check your email to verify your address.',
      data: {
        user: {
          id: authUser.id,
          email: authUser.email,
          fullName,
          phone,
          country
        },
        token: authSession?.access_token || null,
        refreshToken: authSession?.refresh_token || null,
        expiresAt: authSession?.expires_at || null,
        session: authSession
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase() || getSupabaseAdmin();

    if (!supabase) {
      res.status(503).json({
        error: {
          code: 'AUTH_UNAVAILABLE',
          message: 'Supabase authentication service is not configured.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user || !data.session) {
      const isUnconfirmed = error?.message?.toLowerCase().includes('email not confirmed');
      res.status(401).json({
        error: {
          code: isUnconfirmed ? 'EMAIL_NOT_CONFIRMED' : 'INVALID_CREDENTIALS',
          message: isUnconfirmed
            ? 'Please verify your email address before signing in. Check your inbox for the confirmation link.'
            : (error?.message || 'Invalid email or password.'),
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Audit login
    await recordAuditEvent({
      userId: data.user.id,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: data.user.id,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || '',
          country: data.user.user_metadata?.country || 'United States'
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated.',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const supabase = getSupabaseAdmin() || getSupabase();
    let profileData = null;

    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .maybeSingle();
      profileData = data;
    }

    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName || profileData?.full_name,
        phone: profileData?.phone,
        country: profileData?.country
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    const supabase = getSupabase() || getSupabaseAdmin();
    const adminClient = getSupabaseAdmin();

    if (!supabase) {
      res.status(503).json({ error: { message: 'Auth service unavailable' } });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      if (adminClient && error.message.toLowerCase().includes('rate limit')) {
        // Generate recovery link via Admin API when built-in SMTP rate limit is triggered
        const { error: genErr } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email
        });
        if (genErr) {
          res.status(400).json({ error: { message: genErr.message } });
          return;
        }
      } else {
        res.status(400).json({ error: { message: error.message } });
        return;
      }
    }

    // Record audit event
    await recordAuditEvent({
      userId: undefined,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'user',
      resourceId: email,
      ipAddress: req.ip,
      payload: { email }
    });

    res.json({
      success: true,
      message: 'Password reset instructions have been dispatched to your email address.'
    });
  } catch (err) {
    next(err);
  }
}
