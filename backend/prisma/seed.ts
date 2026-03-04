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
    },
    create: {
      email: 'user@canban.pl',
      fullName: 'Użytkownik Testowy',
      role: Role.USER,
      password: userPass,
    },
  });

  console.log('Users seeded:', { admin_email: admin.email, user_email: user.email });

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
        limit: 0, // No limit
        items: {
          create: [
            { content: 'Inicjalizacja repozytorium', order: 0 },
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