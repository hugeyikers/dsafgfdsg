// backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Ensure this matches your Prisma Client location if different, default is @prisma/client

async function main() {
  // Use adapter to connect, matching PrismaService logic
  const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'canban',
      connectionLimit: 1
  });
  
  const prisma = new PrismaClient({ adapter });

  console.log('--- Seeding Kanban Database ---');

  // Create Users
  const hashedPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  // Simple clean check (optional) or just upsert
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@canban.pl' },
    update: {
      fullName: 'Administrator',
      role: Role.ADMINISTRATOR,
      password: hashedPass,
      email: 'admin@canban.pl'
    },
    create: {
      email: 'admin@canban.pl',
      fullName: 'Administrator',
      role: Role.ADMINISTRATOR,
      password: hashedPass,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@canban.pl' },
    update: {
      fullName: 'Użytkownik Testowy',
      role: Role.USER,
      password: userPass,
      email: 'user@canban.pl'
    },
    create: {
      email: 'user@canban.pl',
      fullName: 'Użytkownik Testowy',
      role: Role.USER,
      password: userPass,
    },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@canban.pl' },
    update: {
      fullName: 'Jan Programista',
      role: Role.USER,
      password: userPass,
      email: 'dev@canban.pl',
      limit: 5
    },
    create: {
      email: 'dev@canban.pl',
      fullName: 'Jan Programista',
      role: Role.USER,
      password: userPass,
      limit: 5
    },
  });

  console.log('Users seeded:', { admin_email: admin.email, user_email: user.email, dev_email: dev.email });

  // Create Kanban Rows if not exist
  let standardRow = await prisma.kanbanRow.findFirst({ where: { title: 'Standardowe' } });
  let urgentRow = await prisma.kanbanRow.findFirst({ where: { title: 'Pilne' } });

  const rowsCount = await prisma.kanbanRow.count();
  if (rowsCount === 0) {
    console.log('Seeding Kanban Rows...');
    standardRow = await prisma.kanbanRow.create({ data: { title: 'Standardowe', order: 0 } });
    urgentRow = await prisma.kanbanRow.create({ data: { title: 'Pilne', order: 1, limit: 3 } });
    console.log('Kanban rows seeded.');
  } else {
    console.log('Kanban rows already exist. Skipping.');
  }

  // Create Kanban Columns if not exist
  const columnsCount = await prisma.kanbanColumn.count();
  if (columnsCount === 0) {
    console.log('Seeding Kanban Columns...');
    
    // Create columns sequentially to ensure order
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
                 rowId: standardRow?.id
             },
             { 
                 title: 'Sprawdzić logowanie i rejestrację',
                 content: 'Przetestować endpointy auth/login i auth/register', 
                 order: 1,
                 assignedToId: user.id,
                 rowId: standardRow?.id
             },
             {
                 title: 'Obsługa błędów',
                 content: 'Dodać globalny filtr wyjątków',
                 order: 2,
                 assignedToId: dev.id,
                 rowId: urgentRow?.id
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
                 rowId: urgentRow?.id
             },
             {
                 title: 'Testy jednostkowe backendu',
                 content: 'Napisać testy dla serwisu Kanban',
                 order: 1,
                 assignedToId: admin.id,
                 rowId: standardRow?.id
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
                     rowId: urgentRow?.id
                 }
              ]
          }
      }
    });

    const colDone = await prisma.kanbanColumn.create({
      data: {
        title: 'Zrobione',
        order: 3,
        limit: 0, // No limit
        items: {
          create: [
             { 
                 title: 'Inicjalizacja repozytorium', 
                 content: 'Git init i pierwszy commit',
                 order: 0,
                 assignedToId: admin.id,
                 rowId: standardRow?.id
             },
             {
                 title: 'Konfiguracja Docker',
                 content: 'Dockerfile i docker-compose.yml',
                 order: 1,
                 assignedToId: null, // Unassigned
                 rowId: standardRow?.id
             }
          ]
        }
      }
    });

    console.log('Kanban columns seeded.');
  } else {
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