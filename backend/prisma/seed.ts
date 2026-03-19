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
      email: 'dev@canban.pl'
    },
    create: {
      email: 'dev@canban.pl',
      fullName: 'Jan Programista',
      role: Role.USER,
      password: userPass,
    },
  });

  console.log('Users seeded:', { admin_email: admin.email, user_email: user.email, dev_email: dev.email });

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
                 content: 'Skonfigurować projekt', 
                 order: 0,
                 assignedToId: admin.id 
             },
             { 
                 content: 'Sprawdzić logowanie i rejestrację', 
                 order: 1,
                 assignedToId: user.id
             },
             {
                 content: 'Obsługa błędów',
                 order: 2,
                 assignedToId: dev.id
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
                 content: 'Implementacja frontendu (Swimlanes)', 
                 order: 0,
                 assignedToId: dev.id
             },
             {
                 content: 'Testy jednostkowe backendu',
                 order: 1,
                 assignedToId: admin.id
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
                     content: 'Weryfikacja zmian w migracji',
                     order: 0,
                     assignedToId: admin.id
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
                 content: 'Inicjalizacja repozytorium', 
                 order: 0,
                 assignedToId: admin.id
             },
             {
                 content: 'Konfiguracja Docker',
                 order: 1,
                 assignedToId: null // Unassigned
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