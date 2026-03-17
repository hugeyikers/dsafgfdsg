import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    update(id: number, data: any): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
}
