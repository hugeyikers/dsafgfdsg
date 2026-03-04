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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const alerts_gateway_1 = require("../alerts/alerts.gateway");
let OrdersService = class OrdersService {
    constructor(prisma, alertsGateway) {
        this.prisma = prisma;
        this.alertsGateway = alertsGateway;
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: {
                user: {
                    select: { fullName: true, email: true },
                },
                targetUnit: true,
                items: {
                    include: {
                        resource: true,
                    },
                },
            },
            orderBy: { orderDate: 'desc' },
        });
    }
    async create(data) {
        const resource = await this.prisma.resource.findFirst({
            where: { name: data.resourceName }
        });
        if (!resource) {
            throw new common_1.NotFoundException(`Nie znaleziono zasobu o nazwie: '${data.resourceName}'`);
        }
        return this.prisma.order.create({
            data: {
                status: 'OCZEKUJE',
                notes: data.notes || 'Zamówienie z systemu',
                user: {
                    connect: { id: data.userId }
                },
                items: {
                    create: {
                        quantity: Number(data.quantity),
                        resource: {
                            connect: { id: resource.id }
                        }
                    }
                }
            },
            include: {
                items: true
            }
        });
    }
    async updateStatus(id, quantityReceived, notes) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        resource: {
                            include: { warehouse: true }
                        }
                    }
                }
            }
        });
        if (!order)
            throw new Error('Nie znaleziono zamówienia');
        return this.prisma.$transaction(async (tx) => {
            var _a;
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    status: 'ODEBRANO',
                    notes: notes ? `${order.notes || ''} | Odbiór: ${notes}` : order.notes
                },
            });
            for (const item of order.items) {
                const qtyToAdd = quantityReceived > 0 ? quantityReceived : item.quantity;
                const updatedResource = await tx.resource.update({
                    where: { id: item.resourceId },
                    data: { quantity: { increment: qtyToAdd } },
                    include: { warehouse: true }
                });
                if (updatedResource.quantity <= updatedResource.warningThreshold) {
                    this.alertsGateway.sendCriticalAlert({
                        id: updatedResource.id,
                        resourceName: updatedResource.name,
                        location: ((_a = updatedResource.warehouse) === null || _a === void 0 ? void 0 : _a.name) || 'Nieznany magazyn',
                        priority: 'HIGH',
                        description: `Stan nadal krytyczny po dostawie: ${updatedResource.quantity} ${updatedResource.measurementUnit}`,
                    });
                }
            }
            return updatedOrder;
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alerts_gateway_1.AlertsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map