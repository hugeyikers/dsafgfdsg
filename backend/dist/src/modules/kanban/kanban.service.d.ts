import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateRowDto } from './dto/create-row.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateRowDto } from './dto/update-row.dto';
export declare class KanbanService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<{
        columns: ({
            items: ({
                assignedTo: {
                    password: string;
                    id: number;
                    email: string;
                    fullName: string;
                    role: import(".prisma/client").$Enums.Role;
                    createdAt: Date;
                    limit: number | null;
                };
            } & {
                id: number;
                createdAt: Date;
                title: string;
                order: number;
                updatedAt: Date;
                color: string | null;
                content: string;
                rowId: number | null;
                assignedToId: number | null;
                columnId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            limit: number;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
        })[];
        rows: {
            id: number;
            createdAt: Date;
            limit: number;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
        }[];
    }>;
    createColumn(dto: CreateColumnDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
            content: string;
            rowId: number | null;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    updateColumn(id: number, dto: UpdateColumnDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
            content: string;
            rowId: number | null;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    removeColumn(id: number): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    createRow(dto: CreateRowDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
            content: string;
            rowId: number | null;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    updateRow(id: number, dto: UpdateRowDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            title: string;
            order: number;
            updatedAt: Date;
            color: string | null;
            content: string;
            rowId: number | null;
            assignedToId: number | null;
            columnId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    removeRow(id: number): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }>;
    createItem(dto: CreateItemDto): Promise<{
        assignedTo: {
            password: string;
            id: number;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            limit: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
        content: string;
        rowId: number | null;
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
            limit: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
        content: string;
        rowId: number | null;
        assignedToId: number | null;
        columnId: number;
    }>;
    moveBatch(itemIds: number[], targetColumnId: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
        content: string;
        rowId: number | null;
        assignedToId: number | null;
        columnId: number;
    }[]>;
    removeItem(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
        content: string;
        rowId: number | null;
        assignedToId: number | null;
        columnId: number;
    }>;
    reorderColumns(columnIds: number[]): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }[]>;
    reorderRows(rowIds: number[]): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }[]>;
}
