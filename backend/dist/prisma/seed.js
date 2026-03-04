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
        },
        create: {
            email: 'user@canban.pl',
            fullName: 'Użytkownik Testowy',
            role: client_1.Role.USER,
            password: userPass,
        },
    });
    console.log('Users seeded:', { admin_email: admin.email, user_email: user.email });
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
                        { content: 'Skonfigurować projekt', order: 0 },
                        { content: 'Sprawdzić logowanie', order: 1 },
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
                        { content: 'Implementacja frontendu', order: 0 },
                    ]
                }
            }
        });
        const colDone = await prisma.kanbanColumn.create({
            data: {
                title: 'Zrobione',
                order: 2,
                limit: 0,
                items: {
                    create: [
                        { content: 'Inicjalizacja repozytorium', order: 0 },
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