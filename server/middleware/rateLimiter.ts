import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 5000 : 200, // Higher limit in test mode
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      timestamp: new Date().toISOString()
    }
  }
});

// Stricter rate limiter for sensitive authentication & claim endpoints
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 30, // Limit sensitive attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication or submission attempts. Please slow down and try again later.',
      timestamp: new Date().toISOString()
    }
  }
});
