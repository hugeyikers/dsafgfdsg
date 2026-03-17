import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
    create(createUserDto: any): Promise<{
        password: string;
        id: number;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    update(id: number, updateUserDto: any): Promise<{
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
