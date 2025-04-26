import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {

    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol
    ) { }

    async findAllUsers(paginationDto?: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto || {};

        const users = await this.prisma.user.findMany({
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
        return users;
    }

    async finOneUser(id: number) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })
        if (user) return user;

        throw new HttpException('Usuario não encontrado!', HttpStatus.BAD_REQUEST);
    }

    async createUser(createUserDto: CreateUserDto) {
        try {
            const passwordHash = await this.hashingService.hash(createUserDto.password);

            const userExists = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            })

            if (userExists) {
                throw new HttpException('Email já cadastrado!', HttpStatus.NOT_FOUND);
            }

            const user = await this.prisma.user.create({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: passwordHash,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            })

            return user;

        } catch (error) {
            throw new HttpException('Erro ao cadastrar o usuario!', HttpStatus.BAD_REQUEST);
        }
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        try {
            const findUser = await this.prisma.user.findFirst({
                where: { id },
            });

            if (!findUser) {
                throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
            }

            const dataUser: {name?: string, passwordHash?: string} = {
                name: updateUserDto.name ? updateUserDto.name : findUser.name,
            };   
            
            if (updateUserDto.password) {
                dataUser.passwordHash = await this.hashingService.hash(updateUserDto.password);
            }

            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    name: dataUser.name,
                    email: updateUserDto.email ? updateUserDto.email : findUser.email,
                    passwordHash: dataUser.passwordHash ? dataUser.passwordHash : findUser.passwordHash,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            });

            return user;
        } catch (error) {
            throw new HttpException('Erro ao atualizar o usuario!', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteUser(id: number) {
        try {
            const findUser = await this.prisma.user.findFirst({
                where: { id },
            });

            if (!findUser) {
                throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
            }

            await this.prisma.user.delete({
                where: { id },
            });

            return { message: 'Usuario deletado com sucesso!' };
        } catch (error) {
            throw new HttpException('Erro ao deletar o usuario!', HttpStatus.BAD_REQUEST);
        }
    }
}
