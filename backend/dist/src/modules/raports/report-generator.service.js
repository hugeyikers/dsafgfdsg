"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
const sync_1 = require("csv-stringify/sync");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let ReportGeneratorService = class ReportGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePreview(reportId) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const data = await this.fetchReportData(report.type);
        return {
            reportDetails: report,
            previewData: data.slice(0, 10),
            totalRecords: data.length,
            generatedAt: new Date().toISOString(),
        };
    }
    async generateFileStream(reportId) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const data = await this.fetchReportData(report.type);
        if (report.format === 'pdf') {
            const stream = await this.generatePdf(report, data);
            return {
                stream,
                filename: `report-${report.id}.pdf`,
                contentType: 'application/pdf'
            };
        }
        else {
            const stream = this.generateCsv(data);
            return {
                stream,
                filename: `report-${report.id}.csv`,
                contentType: 'text/csv'
            };
        }
    }
    async fetchReportData(type) {
        switch (type) {
            case 'Raport miesięczny - Stan zasobów':
                return this.prisma.resource.findMany({
                    include: { warehouse: true }
                });
            case 'Raport kwartalny - Efektywność':
                return this.prisma.order.findMany({
                    include: { user: true, items: true }
                });
            case 'Gotowość operacyjna jednostek':
                return this.prisma.militaryUnit.findMany({
                    include: { users: true }
                });
            default:
                return [];
        }
    }
    generatePdf(report, data) {
        return new Promise((resolve) => {
            const doc = new pdfkit_1.default();
            const localFontPath = path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Regular.ttf');
            const winFontPath = 'C:\\Windows\\Fonts\\arial.ttf';
            if (fs.existsSync(localFontPath)) {
                doc.font(localFontPath);
            }
            else if (fs.existsSync(winFontPath)) {
                doc.font(winFontPath);
            }
            else {
                console.warn('⚠️ Brak czcionki z obsługą polskich znaków. Polskie znaki mogą nie wyświetlać się poprawnie.');
            }
            doc.fontSize(20).text(report.title, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Typ: ${report.type}`);
            doc.text(`Data: ${new Date().toLocaleDateString()}`);
            doc.text(`ID Raportu: ${report.id}`);
            doc.moveDown();
            doc.fontSize(14).text('Dane Szczegółowe:', { underline: true });
            doc.moveDown();
            doc.fontSize(10);
            data.forEach((item, index) => {
                const line = `${index + 1}. ` + Object.entries(item).map(([k, v]) => {
                    if (typeof v === 'object' && v !== null)
                        return `${k}: [Detale]`;
                    return `${k}: ${v}`;
                }).join(', ');
                doc.text(line);
                doc.moveDown(0.5);
            });
            doc.end();
            resolve(doc);
        });
    }
    generateCsv(data) {
        const flatData = data.map(item => {
            const flatItem = {};
            for (const [key, value] of Object.entries(item)) {
                if (typeof value === 'object' && value !== null) {
                    flatItem[key] = value.name || value.id || JSON.stringify(value);
                }
                else {
                    flatItem[key] = value;
                }
            }
            return flatItem;
        });
        const csvString = (0, sync_1.stringify)(flatData, { header: true });
        const Readable = require('stream').Readable;
        const s = new Readable();
        s.push(csvString);
        s.push(null);
        return s;
    }
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map