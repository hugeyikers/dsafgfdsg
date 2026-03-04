"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WarehousesService = class WarehousesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.warehouse.findMany({
            include: {
                _count: {
                    select: { resources: true }
                }
            }
        });
    }
    findOne(id) {
        return this.prisma.warehouse.findUnique({
            where: { id },
        });
    }
    create(createWarehouseDto) {
        return this.prisma.warehouse.create({
            data: {
                name: createWarehouseDto.name,
                location: createWarehouseDto.location,
                capacity: Number(createWarehouseDto.capacity) || 0,
            },
        });
    }
    update(id, updateWarehouseDto) {
        return this.prisma.warehouse.update({
            where: { id },
            data: {
                name: updateWarehouseDto.name,
                location: updateWarehouseDto.location,
                capacity: updateWarehouseDto.capacity !== undefined ? Number(updateWarehouseDto.capacity) : undefined,
            },
        });
    }
    remove(id) {
        return this.prisma.warehouse.delete({
            where: { id },
        });
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map