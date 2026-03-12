import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            resources: number;
        };
    } & {
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    }, null, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(createWarehouseDto: CreateWarehouseDto): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateWarehouseDto: UpdateWarehouseDto): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
