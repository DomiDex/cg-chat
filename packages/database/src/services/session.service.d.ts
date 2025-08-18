import { Session } from '@prisma/client';
export declare class SessionService {
    static create(params: {
        userId: string;
        ipAddress?: string;
        userAgent?: string;
        deviceId?: string;
    }): Promise<{
        session: Session;
        tokens: {
            access: string;
            refresh: string;
        };
    }>;
    static validate(token: string): Promise<Session | null>;
    static refresh(refreshToken: string): Promise<{
        session: Session;
        accessToken: string;
    } | null>;
    static revoke(id: string): Promise<void>;
    static cleanExpired(): Promise<number>;
}
//# sourceMappingURL=session.service.d.ts.map