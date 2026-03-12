import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<({
        user: {
            email: string;
            fullName: string;
        };
        targetUnit: {
            id: number;
            name: string;
            code: string | null;
            address: string | null;
        };
        items: ({
            resource: {
                id: number;
                name: string;
                natoCode: string;
                description: string | null;
                quantity: number;
                warningThreshold: number;
                measurementUnit: string;
                warehouseId: number;
                updatedAt: Date;
            };
        } & {
            id: number;
            quantity: number;
            orderId: number;
            resourceId: number;
        })[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        notes: string | null;
        userId: number;
        targetUnitId: number | null;
    })[]>;
    create(req: any, data: {
        resourceName: string;
        quantity: number;
        notes?: string;
    }): Promise<{
        items: {
            id: number;
            quantity: number;
            orderId: number;
            resourceId: number;
        }[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        notes: string | null;
        userId: number;
        targetUnitId: number | null;
    }>;
    updateStatus(id: number, body: {
        quantity: number;
        notes: string;
    }): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        notes: string | null;
        userId: number;
        targetUnitId: number | null;
    }>;
}
