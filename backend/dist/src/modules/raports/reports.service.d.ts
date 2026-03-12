import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, createReportDto: CreateReportDto): Promise<{
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
    updateStatus(id: number, status: ReportStatus): Promise<{
        id: number;
        createdAt: Date;
        authorId: number;
        status: import(".prisma/client").$Enums.ReportStatus;
        title: string;
        type: string;
        format: string;
    }>;
    findOne(id: number): Promise<{
        author: {
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        status: import(".prisma/client").$Enums.ReportStatus;
        title: string;
        type: string;
        format: string;
    }>;
}
