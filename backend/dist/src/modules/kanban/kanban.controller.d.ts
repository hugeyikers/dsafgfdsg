import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateRowDto } from './dto/create-row.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateRowDto } from './dto/update-row.dto';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
    findAll(): Promise<{
        columns: ({
            items: ({
                assignedTo: {
                    id: number;
                    createdAt: Date;
                    email: string;
                    fullName: string;
                    role: import(".prisma/client").$Enums.Role;
                    password: string;
                };
            } & {
                id: number;
                title: string;
                order: number;
                createdAt: Date;
                updatedAt: Date;
                content: string;
                columnId: number;
                rowId: number | null;
                assignedToId: number | null;
            })[];
        } & {
            id: number;
            title: string;
            order: number;
            limit: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        rows: {
            id: number;
            title: string;
            order: number;
            limit: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    createColumn(createColumnDto: CreateColumnDto): Promise<{
        items: {
            id: number;
            title: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
            rowId: number | null;
            assignedToId: number | null;
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
            title: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
            rowId: number | null;
            assignedToId: number | null;
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
    createRow(createRowDto: CreateRowDto): Promise<{
        items: {
            id: number;
            title: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
            rowId: number | null;
            assignedToId: number | null;
        }[];
    } & {
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRow(id: number, updateRowDto: UpdateRowDto): Promise<{
        items: {
            id: number;
            title: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            columnId: number;
            rowId: number | null;
            assignedToId: number | null;
        }[];
    } & {
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeRow(id: number): Promise<{
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createItem(createItemDto: CreateItemDto): Promise<{
        assignedTo: {
            id: number;
            createdAt: Date;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            password: string;
        };
    } & {
        id: number;
        title: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
        rowId: number | null;
        assignedToId: number | null;
    }>;
    moveBatch(body: {
        itemIds: number[];
        targetColumnId: number;
    }): Promise<{
        id: number;
        title: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
        rowId: number | null;
        assignedToId: number | null;
    }[]>;
    updateItem(id: number, updateItemDto: UpdateItemDto): Promise<{
        assignedTo: {
            id: number;
            createdAt: Date;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            password: string;
        };
    } & {
        id: number;
        title: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
        rowId: number | null;
        assignedToId: number | null;
    }>;
    removeItem(id: number): Promise<{
        id: number;
        title: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        columnId: number;
        rowId: number | null;
        assignedToId: number | null;
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
    reorderRows(body: {
        rowIds: number[];
    }): Promise<{
        id: number;
        title: string;
        order: number;
        limit: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
