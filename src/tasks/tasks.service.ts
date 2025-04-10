import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }


    async findAll(paginationDto?: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto || {};

        const tasks = await this.prisma.task.findMany({
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return tasks;
    }

    async findOne(id: number) {
        const task = await this.prisma.task.findFirst({
            where: { id },
        });
        if (task?.name) return task;

        throw new HttpException('Tarefa não foi encontrada!', HttpStatus.NOT_FOUND);
    }

    async findByUserId(userId: number) {
        try {
            const tasks = await this.prisma.task.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (tasks?.length === 0) {
                return {
                    message: 'Nenhuma tarefa encontrada!'
                }
            };

            return tasks;
        } catch (error) {
            throw new HttpException('Erro ao buscar as tarefas!', HttpStatus.BAD_REQUEST);
        }
    }

    async create(createTaskDto: CreateTaskDto) {
        try {
            const task = await this.prisma.task.create({
                data: {
                    name: createTaskDto.name,
                    description: createTaskDto.description,
                    userId: createTaskDto.userId,
                    completedAt: false,
                }
            });
            return task;
        } catch (error) {
            throw new HttpException('Erro ao criar a tarefa!', HttpStatus.BAD_REQUEST);
        }
    }

    async update(id: number, updateTaskDto: UpdateTaskDto) {
        try {
            const findTask = await this.prisma.task.findFirst({
                where: { id },
            });

            if (!findTask) {
                throw new HttpException('Essa tarefa não existe!', HttpStatus.NOT_FOUND);
            }

            const task = await this.prisma.task.update({
                where: { id },
                data: {
                    name: updateTaskDto?.name ? updateTaskDto.name : findTask.name,
                    description: updateTaskDto.description ? updateTaskDto.description : findTask.description,
                    completedAt: updateTaskDto.completedAt ? updateTaskDto.completedAt : findTask.completedAt,
                }
            });

            return task;
        } catch (error) {
            throw new HttpException('Erro ao atualizar a tarefa!', HttpStatus.BAD_REQUEST);

        }
    }

    async delete(id: number) {
        try {
            const findTask = await this.prisma.task.findFirst({
                where: { id },
            });

            if (!findTask) {
                throw new HttpException('Essa tarefa não existe!', HttpStatus.NOT_FOUND);
            }

            await this.prisma.task.delete({
                where: { id: findTask.id },
            })

            return {
                message: 'Tarefa deletada com sucesso!'
            }
        } catch (error) {
            console.log(error);
            throw new HttpException('Erro ao deletar a tarefa!', HttpStatus.BAD_REQUEST);
        }
    }
}
