import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
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
    createColumn(createColumnDto: CreateColumnDto): Promise<{
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
    updateColumn(id: number, updateColumnDto: UpdateColumnDto): Promise<{
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
    createItem(createItemDto: CreateItemDto): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    moveBatch(body: {
        itemIds: number[];
        targetColumnId: number;
    }): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }[]>;
    updateItem(id: number, updateItemDto: UpdateItemDto): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    removeItem(id: number): Promise<{
        id: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
    }>;
    reorderColumns(body: {
        columnIds: number[];
    }): Promise<{
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
