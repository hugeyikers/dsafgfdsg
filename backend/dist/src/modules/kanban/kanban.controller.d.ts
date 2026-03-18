import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
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
    createColumn(createColumnDto: CreateColumnDto): Promise<{
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
    updateColumn(id: number, updateColumnDto: UpdateColumnDto): Promise<{
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
    createItem(createItemDto: CreateItemDto): Promise<{
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
    moveBatch(body: {
        itemIds: number[];
        targetColumnId: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }[]>;
    updateItem(id: number, updateItemDto: UpdateItemDto): Promise<{
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
    removeItem(id: number): Promise<{
        id: number;
        createdAt: Date;
        order: number;
        updatedAt: Date;
        content: string;
        assignedToId: number | null;
        columnId: number;
    }>;
    reorderColumns(body: {
        columnIds: number[];
    }): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        order: number;
        limit: number;
        updatedAt: Date;
    }[]>;
}
