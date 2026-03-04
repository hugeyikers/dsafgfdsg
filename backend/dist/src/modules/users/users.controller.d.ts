import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }[]>;
    create(createUserDto: any): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
    }>;
    update(id: number, updateUserDto: any): Promise<{
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
