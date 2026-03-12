import { PrismaService } from '../../prisma/prisma.service';
export declare class ReportGeneratorService {
    private prisma;
    constructor(prisma: PrismaService);
    generatePreview(reportId: number): Promise<{
        reportDetails: {
            id: number;
            createdAt: Date;
            authorId: number;
            status: import(".prisma/client").$Enums.ReportStatus;
            title: string;
            type: string;
            format: string;
        };
        previewData: ({
            warehouse: {
                id: number;
                name: string;
                location: string | null;
                capacity: number;
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
        })[] | ({
            user: {
                password: string;
                id: number;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.Role;
                militaryUnitId: number | null;
                createdAt: Date;
            };
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
        })[] | ({
            users: {
                password: string;
                id: number;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.Role;
                militaryUnitId: number | null;
                createdAt: Date;
            }[];
        } & {
            id: number;
            name: string;
            code: string | null;
            address: string | null;
        })[];
        totalRecords: number;
        generatedAt: string;
    }>;
    generateFileStream(reportId: number): Promise<{
        stream: any;
        filename: string;
        contentType: string;
    }>;
    private fetchReportData;
    private generatePdf;
    private generateCsv;
}
