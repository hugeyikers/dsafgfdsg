import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
export declare class KanbanService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<({
        items: ({
            assignedTo: {
                password: string;
                id: number;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
            };
        } & {
            id: number;
            createdAt: Date;
            order: number;
            updatedAt: Date;
            content: string;
            assignedToId: number | null;
            columnId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    })[]>;
    createColumn(dto: CreateColumnDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            order: number;
            updatedAt: Date;
            content: string;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    }>;
    updateColumn(id: number, dto: UpdateColumnDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            order: number;
            updatedAt: Date;
            content: string;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    }>;
    removeColumn(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    }>;
    createItem(dto: CreateItemDto): Promise<{
        assignedTo: {
            password: string;
            id: number;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }>;
    updateItem(id: number, dto: UpdateItemDto): Promise<{
        assignedTo: {
            password: string;
            id: number;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }>;
    moveBatch(itemIds: number[], targetColumnId: number): Promise<{
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }[]>;
    removeItem(id: number): Promise<{
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }>;
    reorderColumns(columnIds: number[]): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    }[]>;
}
