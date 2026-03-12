import { PrismaService } from '../../prisma/prisma.service';
export declare class ResourcesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        isCritical: boolean;
        status: string;
        statusText: string;
        warehouse: {
            name: string;
            location: string;
        };
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }[]>;
    findLowStock(): Promise<({
        warehouse: {
            name: string;
        };
    } & {
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    })[]>;
    getWarehouses(): Promise<{
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }>;
    create(data: any): Promise<{
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }>;
    consume(id: number, amount: number, userId: number): Promise<{
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }>;
    move(id: number, targetWarehouseId: number): Promise<{
        id: number;
        name: string;
        natoCode: string;
        description: string | null;
        quantity: number;
        warningThreshold: number;
        measurementUnit: string;
        warehouseId: number;
        updatedAt: Date;
    }>;
}
