import { PrismaService } from '../../prisma/prisma.service';
import { CreateStatusLogDto } from './dto/create-status-log.dto';
export declare class StatusService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, createStatusLogDto: CreateStatusLogDto): Promise<{
        author: {
            email: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        level: string;
        note: string | null;
        isAlert: boolean;
        authorId: number;
    }>;
    findCurrent(): Promise<{
        author: {
            email: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        level: string;
        note: string | null;
        isAlert: boolean;
        authorId: number;
    }>;
    findAll(): Promise<({
        author: {
            email: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        level: string;
        note: string | null;
        isAlert: boolean;
        authorId: number;
    })[]>;
}
