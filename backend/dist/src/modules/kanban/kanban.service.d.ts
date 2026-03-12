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
        items: {
            id: number;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
        }[];
    } & {
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createColumn(dto: CreateColumnDto): Promise<{
        items: {
            id: number;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
        }[];
    } & {
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateColumn(id: number, dto: UpdateColumnDto): Promise<{
        items: {
            id: number;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
        }[];
    } & {
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeColumn(id: number): Promise<{
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createItem(dto: CreateItemDto): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    updateItem(id: number, dto: UpdateItemDto): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    moveBatch(itemIds: number[], targetColumnId: number): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }[]>;
    removeItem(id: number): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    reorderColumns(columnIds: number[]): Promise<{
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
