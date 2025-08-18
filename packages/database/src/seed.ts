import { prisma } from './client';
import { faker } from '@faker-js/faker';
import pino from 'pino';

const log = pino();

async function seed() {
  try {
    log.info('Starting database seeding...');
    
    // Create test users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          emailVerified: faker.datatype.boolean(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.paragraph(),
          role: i === 0 ? 'ADMIN' : i === 1 ? 'SUPPORT' : 'USER',
          subscriptionTier: faker.helpers.arrayElement(['FREE', 'PRO', 'ENTERPRISE']),
        },
      });
      users.push(user);
    }
    
    log.info(`Created ${users.length} test users`);
    
    // Create feature flags
    const featureFlags = [
      {
        key: 'chat_ai_assistant',
        name: 'AI Chat Assistant',
        description: 'Enable AI-powered chat assistant',
        enabled: true,
        percentage: 100,
      },
      {
        key: 'whatsapp_integration',
        name: 'WhatsApp Integration',
        description: 'Enable WhatsApp messaging',
        enabled: false,
        percentage: 0,
      },
      {
        key: 'email_notifications',
        name: 'Email Notifications',
        description: 'Send email notifications for new messages',
        enabled: true,
        percentage: 100,
      },
      {
        key: 'rate_limiting',
        name: 'Rate Limiting',
        description: 'Enable API rate limiting',
        enabled: true,
        percentage: 100,
      },
      {
        key: 'maintenance_mode',
        name: 'Maintenance Mode',
        description: 'Show maintenance page',
        enabled: false,
        percentage: 0,
      },
    ];
    
    for (const flag of featureFlags) {
      const existing = await prisma.featureFlag.findUnique({
        where: { key: flag.key },
      });
      
      if (!existing) {
        await prisma.featureFlag.create({ data: flag });
      }
    }
    
    log.info(`Created ${featureFlags.length} feature flags`);
    
    // Create system configurations
    const systemConfigs = [
      {
        key: 'api_rate_limit',
        value: { max: 100, window: 60000 },
        description: 'API rate limiting configuration',
        dataType: 'json',
      },
      {
        key: 'session_duration',
        value: 1800000, // 30 minutes
        description: 'Session duration in milliseconds',
        dataType: 'number',
      },
      {
        key: 'max_file_size',
        value: 10485760, // 10MB
        description: 'Maximum file upload size in bytes',
        dataType: 'number',
      },
      {
        key: 'allowed_file_types',
        value: ['image/jpeg', 'image/png', 'application/pdf'],
        description: 'Allowed file MIME types',
        dataType: 'json',
      },
      {
        key: 'support_email',
        value: 'support@computerguys.com',
        description: 'Support email address',
        dataType: 'string',
      },
    ];
    
    for (const config of systemConfigs) {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: config.key },
      });
      
      if (!existing) {
        await prisma.systemConfig.create({ data: config });
      }
    }
    
    log.info(`Created ${systemConfigs.length} system configurations`);
    
    // Create API keys for testing
    for (let i = 0; i < 3; i++) {
      const user = users[i];
      if (!user) continue;
      await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: `API Key ${i + 1}`,
          key: faker.string.alphanumeric(32),
          hashedKey: faker.string.alphanumeric(64),
          scopes: ['read', 'write'],
          rateLimit: 100,
        },
      });
    }
    
    log.info('Created test API keys');
    
    log.info('Database seeding completed successfully');
  } catch (error) {
    log.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
if (require.main === module) {
  seed();
}

export { seed };