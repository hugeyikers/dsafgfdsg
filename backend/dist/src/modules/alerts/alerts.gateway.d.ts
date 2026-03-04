import { Server } from 'socket.io';
export declare class AlertsGateway {
    server: Server;
    sendCriticalAlert(payload: any): void;
}
