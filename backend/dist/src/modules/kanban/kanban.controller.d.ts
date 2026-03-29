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
    createColumn(createColumnDto: CreateColumnDto): Promise<{
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
    updateColumn(id: number, updateColumnDto: UpdateColumnDto): Promise<{
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
    createRow(createRowDto: CreateRowDto): Promise<{
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
    updateRow(id: number, updateRowDto: UpdateRowDto): Promise<{
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
    createItem(createItemDto: CreateItemDto): Promise<{
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
    moveBatch(body: {
        itemIds: number[];
        targetColumnId: number;
    }): Promise<{
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
    updateItem(id: number, updateItemDto: UpdateItemDto): Promise<{
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
    reorderColumns(body: {
        columnIds: number[];
    }): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }[]>;
    reorderRows(body: {
        rowIds: number[];
    }): Promise<{
        id: number;
        createdAt: Date;
        limit: number;
        title: string;
        order: number;
        updatedAt: Date;
        color: string | null;
    }[]>;
}
