export declare class WarehouseStatsDto {
    name: string;
    occupancy: number;
}
export declare class DashboardStatsDto {
    totalResources: number;
    lowStockAlerts: number;
    activeOrders: number;
    pendingOrders: number;
    operationalStatus: string;
    isStatusAlert: boolean;
    warehouses: WarehouseStatsDto[];
}
