import { PrismaService } from '../../prisma/prisma.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
export declare class OrdersService {
    private prisma;
    private alertsGateway;
    constructor(prisma: PrismaService, alertsGateway: AlertsGateway);
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
    create(data: {
        resourceName: string;
        quantity: number;
        notes?: string;
        userId: number;
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
    updateStatus(id: number, quantityReceived: number, notes: string): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        notes: string | null;
        userId: number;
        targetUnitId: number | null;
    }>;
}
