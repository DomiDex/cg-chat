import { Prisma, User } from '@prisma/client';
import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        USER: "USER";
        ADMIN: "ADMIN";
        AGENT: "AGENT";
        DEVELOPER: "DEVELOPER";
        SUPPORT: "SUPPORT";
    }>>;
}, z.core.$strip>;
export declare const UpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
}, z.core.$strip>;
export declare class UserService {
    static create(data: z.infer<typeof CreateUserSchema>): Promise<User>;
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
    static update(id: string, data: z.infer<typeof UpdateUserSchema>): Promise<User>;
    static verifyEmail(email: string, token: string): Promise<User | null>;
    static updateLastActive(id: string): Promise<void>;
    static softDelete(id: string): Promise<User>;
    static list(params: {
        skip?: number;
        take?: number;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<{
        users: User[];
        total: number;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map