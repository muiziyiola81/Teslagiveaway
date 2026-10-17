import { Request, Response } from 'express';
import { testDatabaseConnection } from '../db/supabase';
import { config } from '../config';

export async function getHealth(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'ok',
    service: 'tesla-allocation-portal-backend',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
}

export async function getReadiness(req: Request, res: Response): Promise<void> {
  const dbStatus = await testDatabaseConnection();

  const isReady = dbStatus.ok;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not_ready',
    database: {
      connected: dbStatus.ok,
      message: dbStatus.message
    },
    services: {
      supabaseConfigured: config.supabase.isConfigured,
      paymentSandboxConfigured: config.stripe.isConfigured,
      emailConfigured: config.email.isConfigured
    },
    timestamp: new Date().toISOString()
  });
}
