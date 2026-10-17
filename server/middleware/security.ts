import helmet from 'helmet';
import cors from 'cors';
import { RequestHandler } from 'express';
import { config } from '../config';

export function setupSecurityMiddleware(): RequestHandler[] {
  const helmetMiddleware = helmet({
    contentSecurityPolicy: false, // Disabled in dev/vite so dev scripts and HMR assets load without interference
    crossOriginEmbedderPolicy: false
  });

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin direct requests)
      if (!origin) return callback(null, true);

      // If configured origins include '*', allow all
      if (config.corsOrigins.includes('*')) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check against configured origins or local development origins
      const isAllowed =
        config.corsOrigins.some(allowed => {
          const normAllowed = allowed.replace(/\/$/, '');
          return normalizedOrigin === normAllowed || normalizedOrigin.startsWith(normAllowed);
        }) ||
        normalizedOrigin.includes('localhost') ||
        normalizedOrigin.includes('127.0.0.1') ||
        normalizedOrigin.includes('.run.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key']
  });

  return [helmetMiddleware, corsMiddleware];
}
