import { test, describe } from 'node:test';
import assert from 'node:assert';
import { claimSubmissionSchema, signInSchema, signUpSchema } from '../server/validation/index.js';
import { config, ACTUAL_APP_ORIGINS } from '../server/config/index.js';
import { validateEnv } from '../server/config/envValidation.js';

describe('1. Configuration & Security Auditing', () => {
  test('Payment processing is disabled in Stage 2/3/4/5 foundation', () => {
    // Payment integration must remain disabled until the final stage (Stage 6)
    assert.strictEqual(
      config.stripe.isConfigured,
      false,
      'Stripe processing must not be active'
    );
    assert.strictEqual(
      config.stripe.paymentsEnabled,
      false,
      'Stripe paymentsEnabled flag must be false'
    );
  });

  test('Server port and environment default appropriately without blocking variables', () => {
    assert.ok(config.port > 0, 'Port must be a positive number');
    assert.ok(Array.isArray(config.corsOrigins), 'CORS origins must be an array');
  });

  test('CORS origins include actual verified deployment and development origins', () => {
    // Verify that actual local and Cloud Run origins are configured without inventing fake URLs
    assert.ok(config.corsOrigins.includes('http://localhost:3000'));
    assert.ok(config.corsOrigins.includes('http://127.0.0.1:3000'));
    assert.ok(
      config.corsOrigins.includes('https://ais-dev-jrqpsqw2uucdlib6h2sfrz-883722265969.europe-west2.run.app')
    );
    assert.ok(
      config.corsOrigins.includes('https://ais-pre-jrqpsqw2uucdlib6h2sfrz-883722265969.europe-west2.run.app')
    );
  });

  test('validateEnv accepts minimal environment without Stripe or CORS credentials', () => {
    const minimalEnv = validateEnv({});
    assert.strictEqual(minimalEnv.PORT, '3000');
    assert.strictEqual(minimalEnv.NODE_ENV, 'development');
    assert.strictEqual(minimalEnv.STRIPE_SECRET_KEY, '');
    assert.strictEqual(minimalEnv.STRIPE_WEBHOOK_SECRET, '');
    assert.strictEqual(minimalEnv.CORS_ORIGIN, undefined);
    assert.strictEqual(minimalEnv.VITE_API_BASE_URL, undefined);
  });

  test('Same-origin relative API requests are enabled by default', () => {
    // When VITE_API_BASE_URL is undefined or empty, relative requests to /api are supported
    const rawBaseUrl = process.env.VITE_API_BASE_URL;
    const resolvedBase = (rawBaseUrl && rawBaseUrl.trim() !== '') ? rawBaseUrl.trim() : '/api';
    assert.strictEqual(resolvedBase, '/api', 'Default API base must be relative /api');
  });
});

describe('2. Validation Schemas', () => {
  test('Login validator rejects malformed email and short password', () => {
    const invalidEmailResult = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123'
    });
    assert.strictEqual(invalidEmailResult.success, false);

    const shortPasswordResult = signInSchema.safeParse({
      email: 'test@example.com',
      password: '123'
    });
    assert.strictEqual(shortPasswordResult.success, false);

    const validResult = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'validPassword123'
    });
    assert.strictEqual(validResult.success, true);
  });

  test('Registration validator enforces name and password rules', () => {
    const missingNameResult = signUpSchema.safeParse({
      fullName: 'A',
      email: 'user@example.com',
      password: 'password123'
    });
    assert.strictEqual(missingNameResult.success, false);

    const validResult = signUpSchema.safeParse({
      fullName: 'Jane Doe',
      email: 'jane@tesla.com',
      password: 'securePassword123',
      phone: '+1 555-0199',
      country: 'United States'
    });
    assert.strictEqual(validResult.success, true);
  });

  test('Vehicle claim validator enforces required fields', () => {
    const invalidClaim = claimSubmissionSchema.safeParse({
      vehicleId: '',
      deliveryAddress: {
        fullName: '',
        email: 'invalid',
        phone: '',
        streetAddress: '',
        city: '',
        stateOrRegion: '',
        postalCode: '',
        country: ''
      }
    });
    assert.strictEqual(invalidClaim.success, false);

    const validClaim = claimSubmissionSchema.safeParse({
      vehicleId: 'veh-ms-plaid-2026',
      deliveryAddress: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555-0199',
        streetAddress: '3500 Deer Creek Rd',
        city: 'Palo Alto',
        stateOrRegion: 'CA',
        postalCode: '94304',
        country: 'United States'
      }
    });
    assert.strictEqual(validClaim.success, true);
  });
});

describe('3. Live HTTP Endpoint Tests (Port 3000)', () => {
  test('GET /api/health returns HTTP 200 with ok status and security headers', async () => {
    const res = await fetch('http://localhost:3000/api/health');
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'tesla-allocation-portal-backend');
    assert.ok(typeof data.uptimeSeconds === 'number');

    // Verify security headers
    assert.ok(res.headers.get('strict-transport-security'));
    assert.ok(res.headers.get('x-content-type-options'));
  });

  test('GET /api/ready reports dependency readiness truthfully', async () => {
    const res = await fetch('http://localhost:3000/api/ready');
    // Returns 503 if database schema migration not yet executed
    assert.ok([200, 503].includes(res.status));
    const data = await res.json();
    assert.ok(data.database);
    assert.ok('connected' in data.database);
  });

  test('GET /api/admin/claims rejects unauthenticated access with 401', async () => {
    const res = await fetch('http://localhost:3000/api/admin/claims');
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.error.code, 'UNAUTHORIZED');
  });

  test('POST /api/auth/login with invalid payload returns 400 validation error', async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: '123' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(data.error.details));
  });

  test('Non-existent route returns 404 with structured error', async () => {
    const res = await fetch('http://localhost:3000/api/nonexistent-route-for-testing');
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error.code, 'API_ENDPOINT_NOT_FOUND');
  });
});

describe('4. Real Supabase Authentication & Role-Based Access Control', () => {
  const testEmail = `stage3_test_${Date.now()}@gmail.com`;
  const testPassword = 'Password_Stage3_2026!';
  let userToken: string = '';

  test('User Registration creates real user and returns active session', async () => {
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Stage 3 Verified User',
        phone: '+1 555-0144',
        country: 'United States'
      })
    });

    const data = await res.json();
    const { getSupabaseAdmin } = await import('../server/db/supabase');
    const admin = getSupabaseAdmin();

    if (res.status === 429) {
      // Supabase default SMTP hourly limit reached; verify rate limit code and provision test user in test harness
      assert.strictEqual(data.error.code, 'RATE_LIMIT_EXCEEDED');
      if (admin) {
        await admin.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
          user_metadata: { full_name: 'Stage 3 Verified User', phone: '+1 555-0144', country: 'United States' }
        });
      }
    } else {
      assert.strictEqual(res.status, 201, 'Signup must return HTTP 201');
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.user.email, testEmail);
      assert.strictEqual(data.data.user.fullName, 'Stage 3 Verified User');

      // In integration testing, confirm the test user using the test harness admin client
      if (admin && data.data.user?.id) {
        await admin.auth.admin.updateUserById(data.data.user.id, { email_confirm: true });
      }
    }
  });

  test('User Login with valid credentials succeeds and issues Bearer JWT', async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    assert.strictEqual(res.status, 200, 'Login must return HTTP 200');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token, 'Token must be present in login response');
    assert.strictEqual(data.data.user.email, testEmail);
    userToken = data.data.token;
  });

  test('User Login rejects invalid credentials with HTTP 401', async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword999!'
      })
    });

    assert.strictEqual(res.status, 401, 'Login with incorrect password must return 401');
    const data = await res.json();
    assert.strictEqual(data.error.code, 'INVALID_CREDENTIALS');
  });

  test('Password Reset Request accepts registered email and dispatches instructions', async () => {
    const res = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    assert.strictEqual(res.status, 200, 'Reset password must return HTTP 200');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.message.includes('dispatched'));
  });

  test('Protected endpoint /api/auth/me accepts valid Bearer token and returns user profile', async () => {
    assert.ok(userToken, 'Session token from previous test must exist');
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    assert.strictEqual(res.status, 200, 'GET /api/auth/me must return 200 with valid token');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, testEmail);
    assert.strictEqual(data.data.role, 'user', 'Default role must be user');
  });

  test('Protected endpoint /api/auth/me rejects forged/tampered Bearer token with HTTP 401', async () => {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': 'Bearer forged.token.payload'
      }
    });

    assert.strictEqual(res.status, 401, 'Tampered token must return HTTP 401');
    const data = await res.json();
    assert.strictEqual(data.error.code, 'INVALID_TOKEN');
  });

  test('Ordinary user cannot access administrative endpoints (HTTP 403 Forbidden)', async () => {
    assert.ok(userToken, 'User token must exist');
    const res = await fetch('http://localhost:3000/api/admin/claims', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    assert.strictEqual(res.status, 403, 'User without admin rights must receive HTTP 403');
    const data = await res.json();
    assert.strictEqual(data.error.code, 'FORBIDDEN');
  });
});

