import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(user: string, action: string, ip: string): Promise<{
        id: number;
        userId: number | null;
        action: string;
        ip: string | null;
        timestamp: Date;
        userEmailSnapshot: string | null;
    }>;
    findAll(): Promise<({
        user: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: number;
        userId: number | null;
        action: string;
        ip: string | null;
        timestamp: Date;
        userEmailSnapshot: string | null;
    })[]>;
}
