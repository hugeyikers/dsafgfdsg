import { PrismaService } from '../../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<DashboardStatsDto>;
}
