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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const bcrypt = __importStar(require("bcrypt"));
require("dotenv/config");
async function main() {
    const adapter = new adapter_mariadb_1.PrismaMariaDb({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'canban',
        connectionLimit: 1
    });
    const prisma = new client_1.PrismaClient({ adapter });
    console.log('--- Seeding Kanban Database ---');
    const hashedPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@canban.pl' },
        update: {
            fullName: 'Administrator',
            role: client_1.Role.ADMINISTRATOR,
            password: hashedPass,
            email: 'admin@canban.pl'
        },
        create: {
            email: 'admin@canban.pl',
            fullName: 'Administrator',
            role: client_1.Role.ADMINISTRATOR,
            password: hashedPass,
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@canban.pl' },
        update: {
            fullName: 'Użytkownik Testowy',
            role: client_1.Role.USER,
            password: userPass,
            email: 'user@canban.pl'
        },
        create: {
            email: 'user@canban.pl',
            fullName: 'Użytkownik Testowy',
            role: client_1.Role.USER,
            password: userPass,
        },
    });
    const dev = await prisma.user.upsert({
        where: { email: 'dev@canban.pl' },
        update: {
            fullName: 'Jan Programista',
            role: client_1.Role.USER,
            password: userPass,
            email: 'dev@canban.pl'
        },
        create: {
            email: 'dev@canban.pl',
            fullName: 'Jan Programista',
            role: client_1.Role.USER,
            password: userPass,
        },
    });
    console.log('Users seeded:', { admin_email: admin.email, user_email: user.email, dev_email: dev.email });
    let standardRow = await prisma.kanbanRow.findFirst({ where: { title: 'Standardowe' } });
    let urgentRow = await prisma.kanbanRow.findFirst({ where: { title: 'Pilne' } });
    const rowsCount = await prisma.kanbanRow.count();
    if (rowsCount === 0) {
        console.log('Seeding Kanban Rows...');
        standardRow = await prisma.kanbanRow.create({ data: { title: 'Standardowe', order: 0 } });
        urgentRow = await prisma.kanbanRow.create({ data: { title: 'Pilne', order: 1, limit: 3 } });
        console.log('Kanban rows seeded.');
    }
    else {
        console.log('Kanban rows already exist. Skipping.');
    }
    const columnsCount = await prisma.kanbanColumn.count();
    if (columnsCount === 0) {
        console.log('Seeding Kanban Columns...');
        const colTodo = await prisma.kanbanColumn.create({
            data: {
                title: 'Do zrobienia',
                order: 0,
                limit: 10,
                items: {
                    create: [
                        {
                            title: 'Skonfigurować projekt',
                            content: 'Zainstalować zależności i przygotować .env',
                            order: 0,
                            assignedToId: admin.id,
                            rowId: standardRow === null || standardRow === void 0 ? void 0 : standardRow.id
                        },
                        {
                            title: 'Sprawdzić logowanie i rejestrację',
                            content: 'Przetestować endpointy auth/login i auth/register',
                            order: 1,
                            assignedToId: user.id,
                            rowId: standardRow === null || standardRow === void 0 ? void 0 : standardRow.id
                        },
                        {
                            title: 'Obsługa błędów',
                            content: 'Dodać globalny filtr wyjątków',
                            order: 2,
                            assignedToId: dev.id,
                            rowId: urgentRow === null || urgentRow === void 0 ? void 0 : urgentRow.id
                        }
                    ]
                }
            }
        });
        const colInProgress = await prisma.kanbanColumn.create({
            data: {
                title: 'W toku',
                order: 1,
                limit: 5,
                items: {
                    create: [
                        {
                            title: 'Implementacja frontendu (Swimlanes)',
                            content: 'Dodać widok wierszy w React',
                            order: 0,
                            assignedToId: dev.id,
                            rowId: urgentRow === null || urgentRow === void 0 ? void 0 : urgentRow.id
                        },
                        {
                            title: 'Testy jednostkowe backendu',
                            content: 'Napisać testy dla serwisu Kanban',
                            order: 1,
                            assignedToId: admin.id,
                            rowId: standardRow === null || standardRow === void 0 ? void 0 : standardRow.id
                        }
                    ]
                }
            }
        });
        const colReview = await prisma.kanbanColumn.create({
            data: {
                title: 'Code Review',
                order: 2,
                limit: 0,
                items: {
                    create: [
                        {
                            title: 'Weryfikacja zmian w migracji',
                            content: 'Sprawdzić poprawność SQL',
                            order: 0,
                            assignedToId: admin.id,
                            rowId: urgentRow === null || urgentRow === void 0 ? void 0 : urgentRow.id
                        }
                    ]
                }
            }
        });
        const colDone = await prisma.kanbanColumn.create({
            data: {
                title: 'Zrobione',
                order: 3,
                limit: 0,
                items: {
                    create: [
                        {
                            title: 'Inicjalizacja repozytorium',
                            content: 'Git init i pierwszy commit',
                            order: 0,
                            assignedToId: admin.id,
                            rowId: standardRow === null || standardRow === void 0 ? void 0 : standardRow.id
                        },
                        {
                            title: 'Konfiguracja Docker',
                            content: 'Dockerfile i docker-compose.yml',
                            order: 1,
                            assignedToId: null,
                            rowId: standardRow === null || standardRow === void 0 ? void 0 : standardRow.id
                        }
                    ]
                }
            }
        });
        console.log('Kanban columns seeded.');
    }
    else {
        console.log('Kanban columns already exist. Skipping.');
    }
    console.log('--- Seeding finished ---');
    await prisma.$disconnect();
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map