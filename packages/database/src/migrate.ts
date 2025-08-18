import { execSync } from 'child_process';
import { prisma } from './client';
import pino from 'pino';

const log = pino();

async function migrate() {
  try {
    log.info('Starting database migration...');
    
    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    });
    
    log.info('Migrations completed successfully');
    
    // Seed initial data if needed
    await seedDatabase();
    
    log.info('Database setup complete');
  } catch (error) {
    log.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDatabase() {
  // Check if already seeded
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });
  
  if (adminExists) {
    log.info('Database already seeded');
    return;
  }
  
  log.info('Seeding database...');
  
  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@computerguys.com',
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  
  // Create system configurations
  const configs = [
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Enable maintenance mode',
      dataType: 'boolean',
    },
    {
      key: 'max_chat_messages',
      value: 1000,
      description: 'Maximum messages per conversation',
      dataType: 'number',
    },
    {
      key: 'session_timeout',
      value: 1800000, // 30 minutes
      description: 'Session timeout in milliseconds',
      dataType: 'number',
    },
    {
      key: 'rate_limit_window',
      value: 60000, // 1 minute
      description: 'Rate limit window in milliseconds',
      dataType: 'number',
    },
    {
      key: 'rate_limit_max',
      value: 100,
      description: 'Maximum requests per window',
      dataType: 'number',
    },
  ];
  
  for (const config of configs) {
    await prisma.systemConfig.create({
      data: config,
    });
  }
  
  // Create feature flags
  const flags = [
    {
      key: 'new_chat_ui',
      name: 'New Chat UI',
      description: 'Enable redesigned chat interface',
      enabled: false,
      percentage: 0,
    },
    {
      key: 'ai_suggestions',
      name: 'AI Suggestions',
      description: 'Show AI-powered response suggestions',
      enabled: true,
      percentage: 100,
    },
    {
      key: 'voice_input',
      name: 'Voice Input',
      description: 'Enable voice input for messages',
      enabled: false,
      percentage: 0,
    },
  ];
  
  for (const flag of flags) {
    await prisma.featureFlag.create({
      data: flag,
    });
  }
  
  log.info('Database seeded successfully');
}

// Run migration
if (require.main === module) {
  migrate();
}

export { migrate };