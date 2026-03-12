import { ReportsService } from './reports.service';
import { ReportGeneratorService } from './report-generator.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';
export declare class ReportsController {
    private readonly reportsService;
    private readonly reportGenerator;
    constructor(reportsService: ReportsService, reportGenerator: ReportGeneratorService);
    create(req: any, createReportDto: CreateReportDto): Promise<{
        id: number;
        createdAt: Date;
        authorId: number;
        status: import(".prisma/client").$Enums.ReportStatus;
        title: string;
        type: string;
        format: string;
    }>;
    findAll(): Promise<({
        author: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        status: import(".prisma/client").$Enums.ReportStatus;
        title: string;
        type: string;
        format: string;
    })[]>;
    getPreview(id: number): Promise<{
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
    downloadReport(res: any, id: number): Promise<any>;
    updateStatus(req: any, id: number, status: ReportStatus): Promise<{
        id: number;
        createdAt: Date;
        authorId: number;
        status: import(".prisma/client").$Enums.ReportStatus;
        title: string;
        type: string;
        format: string;
    }>;
}
