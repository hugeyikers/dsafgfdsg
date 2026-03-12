import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }[]>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }>;
}
