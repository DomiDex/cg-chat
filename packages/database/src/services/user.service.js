import { Role } from '@prisma/client';
import { prisma } from '../client';
import { z } from 'zod';
// Validation schemas
export const CreateUserSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).default(Role.USER),
});
export const UpdateUserSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
    preferences: z.record(z.any()).optional(),
});
export class UserService {
    // Create user
    static async create(data) {
        const validated = CreateUserSchema.parse(data);
        return prisma.user.create({
            data: {
                ...validated,
                emailVerified: false,
                preferences: {},
                metadata: {},
            },
        });
    }
    // Find user by email
    static async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    // Find user by ID
    static async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
    // Update user
    static async update(id, data) {
        const validated = UpdateUserSchema.parse(data);
        return prisma.user.update({
            where: { id },
            data: {
                ...validated,
                updatedAt: new Date(),
            },
        });
    }
    // Verify email
    static async verifyEmail(email, token) {
        const user = await prisma.user.findFirst({
            where: {
                email,
                verificationToken: token,
                verificationExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user)
            return null;
        return prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationExpiry: null,
            },
        });
    }
    // Update last active
    static async updateLastActive(id) {
        await prisma.user.update({
            where: { id },
            data: { lastActive: new Date() },
        });
    }
    // Soft delete
    static async softDelete(id) {
        return prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    // List users with pagination
    static async list(params) {
        const { skip = 0, take = 10, where, orderBy } = params;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take,
                where: {
                    ...where,
                    deletedAt: null,
                },
                orderBy: orderBy || { createdAt: 'desc' },
            }),
            prisma.user.count({
                where: {
                    ...where,
                    deletedAt: null,
                },
            }),
        ]);
        return { users, total };
    }
}
//# sourceMappingURL=user.service.js.map