import { prisma, checkDatabaseHealth } from './src/client';
import { UserService } from './src/services/user.service';
import pino from 'pino';

const log = pino({ transport: { target: 'pino-pretty' } });

async function testConnection() {
  try {
    log.info('Testing database connection...');
    
    // Test health check
    const isHealthy = await checkDatabaseHealth();
    log.info({ isHealthy }, 'Database health check');
    
    // Test creating a user
    const testUser = await UserService.create({
      email: 'test@computerguys.com',
      name: 'Test User',
    });
    log.info({ userId: testUser.id }, 'Created test user');
    
    // Test finding user
    const foundUser = await UserService.findByEmail('test@computerguys.com');
    log.info({ found: !!foundUser }, 'Found user by email');
    
    // Test listing users
    const { users, total } = await UserService.list({});
    log.info({ totalUsers: total }, 'Listed users');
    
    // Clean up - delete test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    log.info('Cleaned up test user');
    
    log.info('✅ Database connection test successful!');
  } catch (error) {
    log.error({ error }, '❌ Database connection test failed');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();