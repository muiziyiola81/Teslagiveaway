import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './server/config';
import { setupSecurityMiddleware } from './server/middleware/security';
import { apiLimiter } from './server/middleware/rateLimiter';
import { errorHandler } from './server/middleware/errorHandler';
import { requestLogger } from './server/middleware/logger';
import apiRoutes from './server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // 1. Trust proxy (for Cloud Run / reverse proxy environments and rate limiter)
  app.set('trust proxy', 1);

  // 2. Request Logging
  app.use(requestLogger);

  // 3. Security Middleware (Helmet & CORS)
  const [helmetMiddleware, corsMiddleware] = setupSecurityMiddleware();
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // 3. Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Rate Limiting for API routes
  app.use('/api', apiLimiter);

  // 5. Mount API Routes
  app.use('/api', apiRoutes);

  // 6. Explicit 404 for unhandled API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: {
        code: 'API_ENDPOINT_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} does not exist.`,
        timestamp: new Date().toISOString()
      }
    });
  });

  // 7. Frontend Integration: Vite middleware in Dev, Static dist in Production
  if (!config.isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 8. Centralized Global Error Handler
  app.use(errorHandler);

  // 9. Start listening
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 [Server] Production-ready backend running on http://0.0.0.0:${config.port}`);
    console.log(`🔌 [API] Health check: http://localhost:${config.port}/api/health`);
    console.log(`🔌 [API] Readiness check: http://localhost:${config.port}/api/ready`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] Closed HTTP server.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('[Fatal] Failed to start server:', err);
  process.exit(1);
});
