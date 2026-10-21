import dotenv from 'dotenv';
import { validateEnv, ValidatedEnv } from './envValidation';

dotenv.config();

// Validate and normalize environment variables
const env: ValidatedEnv = validateEnv(process.env);

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  corsOrigins: string[];
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
    isConfigured: boolean;
  };
  admin: {
    authorizedEmails: string[];
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    isConfigured: boolean;
    paymentsEnabled: boolean;
  };
  email: {
    resendApiKey: string;
    supportEmail: string;
    isConfigured: boolean;
  };
}

/**
 * Actual verified origins for this application:
 * - Local development servers (port 3000)
 * - Cloud Run development instance
 * - Cloud Run preview/shared instance
 * 
 * Production and staging origins are never invented.
 */
export const ACTUAL_APP_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ais-dev-jrqpsqw2uucdlib6h2sfrz-883722265969.europe-west2.run.app',
  'https://ais-pre-jrqpsqw2uucdlib6h2sfrz-883722265969.europe-west2.run.app'
];

// If custom CORS_ORIGIN is specified in .env, combine with actual application origins
const customCors = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const corsOrigins = Array.from(new Set([...ACTUAL_APP_ORIGINS, ...customCors]));

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

const defaultAdminEmails = [
  'muiziyiola81@gmail.com',
  'miizlake@gmail.com',
  'admin@tesla-allocation.internal'
];

const customAdminEmails = env.ADMIN_EMAILS
  ? env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  : [];

const authorizedEmails = Array.from(new Set([...defaultAdminEmails, ...customAdminEmails]));

export const config: ServerConfig = {
  port: parseInt(env.PORT, 10) || 3000,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  corsOrigins,
  supabase: {
    url: supabaseUrl,
    serviceRoleKey: supabaseServiceRoleKey,
    anonKey: supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey))
  },
  admin: {
    authorizedEmails
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    // CRITICAL: Payment integration is strictly disabled until Stage 6.
    // The backend starts normally without any Stripe credentials.
    isConfigured: false,
    paymentsEnabled: false
  },
  email: {
    resendApiKey: env.RESEND_API_KEY,
    supportEmail: env.SUPPORT_EMAIL,
    isConfigured: Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY !== 're_placeholder_key')
  }
};
