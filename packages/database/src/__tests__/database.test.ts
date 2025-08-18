import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, checkDatabaseHealth } from '../client';
import { UserService } from '../services/user.service';

describe('Database', () => {
  beforeAll(async () => {
    // Clean test database
    await prisma.user.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('Health Check', () => {
    it('should connect to database', async () => {
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });
  });
  
  describe('User Service', () => {
    it('should create a user', async () => {
      const user = await UserService.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.emailVerified).toBe(false);
    });
    
    it('should find user by email', async () => {
      const user = await UserService.findByEmail('test@example.com');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });
    
    it('should update user', async () => {
      const user = await UserService.findByEmail('test@example.com');
      if (!user) throw new Error('User not found');
      
      const updated = await UserService.update(user.id, {
        name: 'Updated Name',
        bio: 'Test bio',
      });
      
      expect(updated.name).toBe('Updated Name');
      expect(updated.bio).toBe('Test bio');
    });
  });
});