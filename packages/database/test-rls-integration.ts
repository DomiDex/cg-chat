import { prismaRLS } from './src/client-rls';
import { RLSContext } from './src/utils/rls';
import pino from 'pino';

const log = pino({ transport: { target: 'pino-pretty' } });

async function testRLSIntegration() {
  try {
    log.info('Starting RLS integration test...');
    
    // Test 1: Create a test user
    log.info('Creating test user...');
    const testUser = await prismaRLS.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'USER',
      },
    });
    log.info({ userId: testUser.id }, 'Created test user');
    
    // Test 2: Create admin user
    const adminUser = await prismaRLS.user.create({
      data: {
        email: `admin-${Date.now()}@example.com`,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    log.info({ userId: adminUser.id }, 'Created admin user');
    
    // Test 3: Test user context - should only see own data
    log.info('Testing user context (should only see own data)...');
    const userContext: RLSContext = {
      userId: testUser.id,
      userRole: 'USER',
    };
    
    const userSessions = await prismaRLS.$withRLS(userContext, async () => {
      // Create a session for the test user
      await prismaRLS.session.create({
        data: {
          userId: testUser.id,
          token: `token-${Date.now()}`,
          refreshToken: `refresh-${Date.now()}`,
          expiresAt: new Date(Date.now() + 3600000),
          refreshExpiresAt: new Date(Date.now() + 86400000), // 24 hours
        },
      });
      
      // Try to query all sessions - should only see own
      return prismaRLS.session.findMany();
    });
    
    log.info({ count: userSessions.length }, 'User can see sessions');
    
    // Test 4: Test admin context - should see all data
    log.info('Testing admin context (should see all data)...');
    const adminContext: RLSContext = {
      userId: adminUser.id,
      userRole: 'ADMIN',
    };
    
    const adminSessions = await prismaRLS.$withRLS(adminContext, async () => {
      return prismaRLS.session.findMany();
    });
    
    log.info({ count: adminSessions.length }, 'Admin can see sessions');
    
    // Test 5: Test API key creation with RLS
    log.info('Testing API key creation with RLS...');
    await prismaRLS.$withRLS(userContext, async () => {
      await prismaRLS.apiKey.create({
        data: {
          userId: testUser.id,
          name: 'Test API Key',
          key: `key-${Date.now()}`,
          hashedKey: `hashed-${Date.now()}`,
          scopes: ['read'],
        },
      });
    });
    
    // Test 6: Verify RLS policies are working
    log.info('Verifying RLS policies...');
    const userApiKeys = await prismaRLS.$withRLS(userContext, async () => {
      return prismaRLS.apiKey.findMany();
    });
    
    log.info({ count: userApiKeys.length }, 'User API keys found');
    
    // Test 7: Test support role
    const supportUser = await prismaRLS.user.create({
      data: {
        email: `support-${Date.now()}@example.com`,
        name: 'Support User',
        role: 'SUPPORT',
      },
    });
    
    const supportContext: RLSContext = {
      userId: supportUser.id,
      userRole: 'SUPPORT',
    };
    
    const supportView = await prismaRLS.$withRLS(supportContext, async () => {
      const users = await prismaRLS.user.findMany();
      const sessions = await prismaRLS.session.findMany();
      return { users: users.length, sessions: sessions.length };
    });
    
    log.info(supportView, 'Support user view');
    
    // Cleanup
    log.info('Cleaning up test data...');
    await prismaRLS.$bypassRLS(async () => {
      await prismaRLS.apiKey.deleteMany({
        where: { userId: { in: [testUser.id, adminUser.id, supportUser.id] } },
      });
      await prismaRLS.session.deleteMany({
        where: { userId: { in: [testUser.id, adminUser.id, supportUser.id] } },
      });
      await prismaRLS.user.deleteMany({
        where: { id: { in: [testUser.id, adminUser.id, supportUser.id] } },
      });
    });
    
    log.info('✅ RLS integration test completed successfully!');
    
  } catch (error) {
    log.error(error, '❌ RLS integration test failed');
    process.exit(1);
  } finally {
    await prismaRLS.$disconnect();
  }
}

// Run the test
testRLSIntegration();