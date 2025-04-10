import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { BodyCreateTaskInterceptor } from 'src/common/interceptors/body-create-task.interceptor';

@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) {}

    @Get()
    @UseInterceptors(LoggerInterceptor)
    findAllTasks(@Query() paginationDto: PaginationDto) {
        return this.taskService.findAll(paginationDto);
    }

    @Get(':id')
    findOneTask(@Param('id', ParseIntPipe) id: number) {
        return this.taskService.findOne(id);
    }

    @Get('userId/:userId')
    findTasksByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.taskService.findByUserId(userId);
    }
    

    @Post()
    @UseInterceptors(BodyCreateTaskInterceptor)
    createTask(@Body() createTaskDto: CreateTaskDto) {
        return this.taskService.create(createTaskDto);
    }

    @Patch(':id')
    updateTask(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(id, updateTaskDto);
    }

    @Delete(':id')
    deleteTask(@Param('id', ParseIntPipe) id: number) {
        return this.taskService.delete(id);
    }

    
}
