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
exports.ResourcesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ResourcesService = class ResourcesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const resources = await this.prisma.resource.findMany({
            include: {
                warehouse: {
                    select: { name: true, location: true }
                }
            }
        });
        return resources.map(r => (Object.assign(Object.assign({}, r), { isCritical: r.quantity <= r.warningThreshold, status: r.quantity <= r.warningThreshold ? 'critical' : 'ok', statusText: r.quantity <= r.warningThreshold ? 'KRYTYCZNY' : 'W NORMIE' })));
    }
    async findLowStock() {
        return this.prisma.resource.findMany({
            where: {
                quantity: { lte: this.prisma.resource.fields.warningThreshold }
            },
            include: {
                warehouse: { select: { name: true } }
            }
        });
    }
    async getWarehouses() {
        return this.prisma.warehouse.findMany();
    }
    async findOne(id) {
        return this.prisma.resource.findUnique({ where: { id } });
    }
    async create(data) {
        if (!data.warehouseId) {
            const w = await this.prisma.warehouse.findFirst();
            if (w)
                data.warehouseId = w.id;
        }
        const payload = Object.assign(Object.assign({}, data), { quantity: Number(data.quantity), warningThreshold: Number(data.warningThreshold), warehouseId: Number(data.warehouseId) });
        return this.prisma.resource.create({ data: payload });
    }
    async update(id, data) {
        const updateData = {};
        if (data.quantity !== undefined)
            updateData.quantity = Number(data.quantity);
        if (data.warningThreshold !== undefined)
            updateData.warningThreshold = Number(data.warningThreshold);
        if (data.name)
            updateData.name = data.name;
        return this.prisma.resource.update({
            where: { id },
            data: updateData
        });
    }
    async consume(id, amount, userId) {
        const resource = await this.prisma.resource.findUnique({ where: { id } });
        if (!resource)
            throw new common_1.NotFoundException('Resource not found');
        if (resource.quantity < amount) {
            throw new Error('Not enough stock');
        }
        const updated = await this.prisma.resource.update({
            where: { id },
            data: { quantity: { decrement: amount } }
        });
        return updated;
    }
    async move(id, targetWarehouseId) {
        return this.prisma.resource.update({
            where: { id },
            data: { warehouseId: targetWarehouseId }
        });
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResourcesService);
//# sourceMappingURL=resources.service.js.map