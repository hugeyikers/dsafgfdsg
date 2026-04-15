import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    KanbanModule,
  ],
  providers: [
    PrismaService,
  ],
})
export class AppModule {}