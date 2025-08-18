import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';

// Singleton pattern for Prisma client
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Neon serverless pool for edge functions
export function createNeonPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection pool configuration
    max: 20, // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Transaction helper
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return fn(tx as PrismaClient);
  });
}

// Retry logic for transient failures
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error;
      
      // Check if error is retryable
      const retryableCodes = ['P2024', 'P2034', 'P1001'];
      if (!retryableCodes.some(code => error.code === code)) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

export default prisma;