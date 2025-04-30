import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { extname, resolve } from 'path';
import * as fs from 'node:fs/promises'

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
                avatar: true,
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
                avatar: true,
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

    async updateUser(id: number, updateUserDto: UpdateUserDto, tokenPayload: PayloadTokenDto) {
        console.log(tokenPayload);

        try {
            const findUser = await this.prisma.user.findFirst({
                where: { id },
            });

            if (!findUser) {
                throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
            }

            if (findUser.id !== tokenPayload.sub) {
                throw new HttpException('Usuario não existe!', HttpStatus.BAD_REQUEST);
            }

            const dataUser: { name?: string, passwordHash?: string } = {
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
                    avatar: true,
                }
            });

            return user;
        } catch (error) {
            throw new HttpException('Erro ao atualizar o usuario!', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteUser(id: number, tokenPayload: PayloadTokenDto) {
        try {
            const findUser = await this.prisma.user.findFirst({
                where: { id },
            });

            if (!findUser) {
                throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
            }

            if (findUser.id !== tokenPayload.sub) {
                throw new HttpException('Usuario não existe!', HttpStatus.BAD_REQUEST);
            }

            await this.prisma.user.delete({
                where: { id },
            });

            return { message: 'Usuario deletado com sucesso!' };
        } catch (error) {
            throw new HttpException('Erro ao deletar o usuario!', HttpStatus.BAD_REQUEST);
        }
    }

    async uploadAvatarImage(tokenPayload: PayloadTokenDto, file: Express.Multer.File) {
        try {
            const fileExtension = extname(file.originalname)

            const fileName = `${tokenPayload.sub}${fileExtension}`
            const fileLocale = resolve(process.cwd(), 'files', fileName)

            await fs.writeFile(fileLocale, file.buffer)


            const findUser = await this.prisma.user.findFirst({
                where: { id: tokenPayload.sub },
            });

            if (!findUser) {
                throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
            }

            const updateUser = await this.prisma.user.update({
                where: { id: findUser.id },
                data: {
                    avatar: fileName,
                },select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            })

            return updateUser

        } catch (error) {
            throw new HttpException('Erro ao fazer upload da imagem!', HttpStatus.BAD_REQUEST);
        }

    }
}
