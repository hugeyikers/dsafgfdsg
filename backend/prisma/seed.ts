// backend/prisma/seed.ts
import { PrismaClient, Role, Size } from '@prisma/client';
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
      database: process.env.DB_NAME || 'kanban',
      connectionLimit: 1
  });
  
  const prisma = new PrismaClient({ adapter });

  const itemDefaults = {
    color: null as string | null,
    deadline: null as Date | null,
    size: Size.M,
    archived: false,
  };

  console.log('--- Seeding Kanban Database ---');

  // Create Users
  const hashedPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  // Simple clean check (optional) or just upsert
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kanban.pl' },
    update: {
      fullName: 'Administrator',
      role: Role.ADMINISTRATOR,
      password: hashedPass,
      email: 'admin@kanban.pl'
    },
    create: {
      email: 'admin@kanban.pl',
      fullName: 'Administrator',
      role: Role.ADMINISTRATOR,
      password: hashedPass,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@kanban.pl' },
    update: {
      fullName: 'Użytkownik Testowy',
      role: Role.USER,
      password: userPass,
      email: 'user@kanban.pl'
    },
    create: {
      email: 'user@kanban.pl',
      fullName: 'Użytkownik Testowy',
      role: Role.USER,
      password: userPass,
    },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@kanban.pl' },
    update: {
      fullName: 'Jan Programista',
      role: Role.USER,
      password: userPass,
      email: 'dev@kanban.pl',
      limit: 5
    },
    create: {
      email: 'dev@kanban.pl',
      fullName: 'Jan Programista',
      role: Role.USER,
      password: userPass,
      limit: 5
    },
  });

  console.log('Users seeded:', { admin_email: admin.email, user_email: user.email, dev_email: dev.email });

  // Create Kanban Rows if not exist
  let standardRow = await prisma.kanbanRow.findFirst({ where: { title: 'Standard' } });
  let urgentRow = await prisma.kanbanRow.findFirst({ where: { title: 'Urgent' } });

  const rowsCount = await prisma.kanbanRow.count();
  if (rowsCount === 0) {
    console.log('Seeding Kanban Rows...');
    standardRow = await prisma.kanbanRow.create({
      data: {
        title: 'Standard',
        order: 0,
        limit: 0,
        color: null,
      },
    });
    urgentRow = await prisma.kanbanRow.create({
      data: {
        title: 'Urgent',
        order: 1,
        limit: 3,
        color: null,
      },
    });
    console.log('Kanban rows seeded.');
  } else {
    console.log('Kanban rows already exist. Skipping.');
  }

  // Create Kanban Columns if not exist
  const columnsCount = await prisma.kanbanColumn.count();
  if (columnsCount === 0) {
    console.log('Seeding Kanban Columns...');
    
    // Create columns sequentially to ensure order
    await prisma.kanbanColumn.create({
      data: {
        title: 'Backlog',
        order: 0,
        limit: 0,
        items: {
          create: [
             { 
                 title: 'Frontend | theming',
                 content: 'Implement theming into application',
               ...itemDefaults,
                 order: 0,
                 assignedUsers: {
                    connect: [{ id: user.id }] 
                 },
                 rowId: standardRow?.id,
                 subtasks: {
                      create: [
                        {
                          title: 'Basic light and dark theme',
                          content: 'Implement basic light and dark themes, detecting which theme the OS uses.',
                          isDone: false
                        },
                        {
                         title: 'Custom theme',
                         content: 'Implement setting custom user-made themes using a color picker tool.',
                         isDone: false 
                        }
                      ]
                 }
             },
             { 
                 title: 'Frontend | Multi user assign',
               content: 'Implement the ability to assign multiple users to tasks.',
               ...itemDefaults,
                 order: 1,
                 assignedUsers: {
                    connect: [{ id: user.id }] 
                 },
                 rowId: standardRow?.id
             },
             {
                 title: 'Frontend | fix disappearing tasks bug',
                 content: 'Tasks sometimes get deleted when getting moved.',
               ...itemDefaults,
                 order: 2,
                 assignedUsers: {
                    connect: [{ id: dev.id }] 
                 },
                 rowId: urgentRow?.id,
                 subtasks: {
                  create: [
                    {
                      title: 'Identified the problem',
                      content: 'Source of the problem was found.',
                      isDone: false
                    }
                  ]
                 }
             }
          ]
        }
      }
    });

    await prisma.kanbanColumn.create({
      data: {
        title: 'In Progress',
        order: 1,
        limit: 5,
        items: {
          create: [
             { 
                 title: 'Tests',
                 content: 'Perform e2e testing',
                 ...itemDefaults,
                 order: 0,
                  assignedUsers: {
                    connect: [{ id: dev.id }] 
                 },
                 rowId: urgentRow?.id
             },
             {
                 title: 'Frontend | font size update',
                 content: 'Increase the font size across the application so that it is more readable.',
               ...itemDefaults,
                 order: 1,
                 assignedUsers: {
                    connect: [{ id: dev.id }] 
                 },
                 rowId: standardRow?.id,
                 subtasks: {
                  create: [
                    {
                      title: 'Main screen fonts',
                      content: 'Update fonts on the main screen',
                      isDone: true
                    },
                    {
                      title: 'Settings fonts',
                      content: 'Update fonts on the settings screen',
                      isDone: false
                    }
                  ]
                 }
             }
          ]
        }
      }
    });

    await prisma.kanbanColumn.create({
      data: {
          title: 'In Review',
          order: 2,
          limit: 5,
          items: {
              create: [
                 {
                     title: 'Backend | Update Prisma seed',
                     content: 'All elements should be in English, also add more tasks.',
                   ...itemDefaults,
                     order: 0,
                     assignedUsers: {
                        connect: [{ id: admin.id }] 
                     },
                     rowId: urgentRow?.id,
                     subtasks: {
                      create: [
                        {
                          title: 'Translate to English',
                          content: 'Translate all database contents to English.',
                          isDone: true
                        },
                        {
                          title: 'Add more tasks',
                          content: 'Add more tasks and subtasks to all columns.',
                          isDone: true
                        }
                      ]
                      
                 }
                 }
              ]
          }
      }
    });

    await prisma.kanbanColumn.create({
      data: {
        title: 'Done',
        order: 3,
        limit: 0, // No limit
        items: {
          create: [
             { 
               title: 'Frontend | wip limit per column and row',
                 content: 'Implement setting task limits per column and row; they should turn red once the limit is surpassed.',
               ...itemDefaults,
                 order: 0,
                 assignedUsers: {
                    connect: [{ id: admin.id }] 
                 },
                 rowId: standardRow?.id
             },
             {
                 title: 'Docker configuration',
                 content: 'Dockerfile and docker-compose.yml',
               ...itemDefaults,
                 order: 1,
                 rowId: standardRow?.id,
                 subtasks: {
                  create: [
                    {
                      title: 'dockerfile',
                      content: 'add dockerfile',
                      isDone: true
                    },
                    {
                      title: 'docker-compose.yml',
                      content: 'add docker-compose.yml',
                      isDone: true
                    }
                  ]
                 }
             },
             {
              title: 'Backend | code refactor',
              content: 'Refactor the code to make it more readable.',
              ...itemDefaults,
              order: 2,
              assignedUsers: {
                    connect: [{ id: admin.id }] 
                 },
              rowId: standardRow?.id
             },
             {
              title: 'Frontend | tidy up the UI',
              content: 'Clean up the UI so that it is more readable.',
              ...itemDefaults,
              order: 3,
              assignedUsers: {
                connect: [{ id: user.id }]
              },
              rowId: standardRow?.id
             }
          ]
        }
      }
    });

    console.log('Kanban columns seeded.');
    // Create an example parent-child relation: find a seeded item and add a child
    try {
      const parent = await prisma.kanbanItem.findFirst({ where: { title: 'Frontend | theming' } });
      if (parent) {
        await prisma.kanbanItem.create({
          data: {
            title: 'Theming - child task',
            content: 'Child task for theming',
            order: parent.order + 1,
            columnId: parent.columnId,
            rowId: parent.rowId ?? null,
            parentId: parent.id,
            color: null,
            deadline: null,
            size: Size.M,
            archived: false,
          },
        });
        console.log('Created example child for:', parent.title);
      }
    } catch (e) {
      console.warn('Failed to create example child item:', e);
    }
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