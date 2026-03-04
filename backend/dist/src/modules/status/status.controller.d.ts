import { StatusService } from './status.service';
import { CreateStatusLogDto } from './dto/create-status-log.dto';
export declare class StatusController {
    private readonly statusService;
    constructor(statusService: StatusService);
    create(req: any, createStatusLogDto: CreateStatusLogDto): Promise<{
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
