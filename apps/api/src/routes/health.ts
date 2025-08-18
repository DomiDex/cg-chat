import { Hono } from 'hono';
import Redis from 'ioredis';
import { convexClient } from '../index.js';
import { api } from '../../../../packages/convex/_generated/api.js';

export const healthRoutes = new Hono();

// Basic health check
healthRoutes.get('/', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Detailed health check
healthRoutes.get('/detailed', async (c) => {
  const checks: Record<string, unknown> = {
    api: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    },
  };

  // Check Convex connection
  try {
    const testQuery = await convexClient.query(api.users.getUserCount, {});
    checks.convex = {
      status: 'healthy',
      connected: true,
      userCount: testQuery,
    };
  } catch (error) {
    checks.convex = {
      status: 'unhealthy',
      connected: false,
      error: (error as Error).message,
    };
  }

  // Check Redis connection
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });

    await redis.ping();
    const info = await redis.info('server');
    const version = info.match(/redis_version:(.+)/)?.[1];

    checks.redis = {
      status: 'healthy',
      connected: true,
      version,
    };

    redis.disconnect();
  } catch (error) {
    checks.redis = {
      status: 'unhealthy',
      connected: false,
      error: (error as Error).message,
    };
  }

  // Check Twilio configuration
  checks.twilio = {
    status: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
    accountSid: process.env.TWILIO_ACCOUNT_SID ? 
      `${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...` : null,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 
      `${process.env.TWILIO_PHONE_NUMBER.substring(0, 6)}...` : null,
  };

  // Overall health status
  const overallStatus = Object.values(checks).every(
    (check: any) => check.status === 'healthy' || check.status === 'configured'
  ) ? 'healthy' : 'degraded';

  return c.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// Readiness check (for Kubernetes)
healthRoutes.get('/ready', async (c) => {
  try {
    // Check if Convex is accessible
    await convexClient.query(api.users.getUserCount, {});
    
    return c.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        ready: false,
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      503
    );
  }
});

// Liveness check (for Kubernetes)
healthRoutes.get('/live', async (c) => {
  return c.json({
    alive: true,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// Metrics endpoint (for monitoring)
healthRoutes.get('/metrics', async (c) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return c.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  });
});