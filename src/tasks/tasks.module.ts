import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApiExceptionFilter } from 'src/common/filters/exception-filter';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    }
  ]
})
export class TasksModule { }
