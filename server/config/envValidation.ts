import { z } from 'zod';

/**
 * Environment variable schema validation.
 * Ensures all configuration values are properly parsed and typed.
 * 
 * Rules:
 * - STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are optional (payments disabled until Stage 6).
 * - CORS_ORIGIN is optional (defaults to actual local dev & Cloud Run deployment origins).
 * - VITE_API_BASE_URL is optional (defaults to '/api' for same-origin requests).
 * - Private secrets must never be exposed to the browser.
 */
export const envSchema = z.object({
  PORT: z.string().optional().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  CORS_ORIGIN: z.string().optional(),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  ADMIN_EMAILS: z.string().optional().default(''),
  // Stripe payment integration is disabled until Stage 6; keys are strictly optional
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  // Transactional email
  RESEND_API_KEY: z.string().optional().default(''),
  SUPPORT_EMAIL: z.string().optional().default('support@tesla-allocation-portal.internal'),
  // Client Vite variables (optional)
  VITE_API_BASE_URL: z.string().optional(),
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional()
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates and normalizes raw process.env without throwing fatal errors on optional keys.
 */
export function validateEnv(rawEnv: Record<string, string | undefined> = process.env): ValidatedEnv {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    console.warn('[Config] Environment validation warnings (using defaults):', result.error.flatten().fieldErrors);
    return envSchema.parse({});
  }
  return result.data;
}
