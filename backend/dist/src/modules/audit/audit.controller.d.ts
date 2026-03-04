import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
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
