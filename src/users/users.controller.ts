import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'node:path';
import * as fs from 'node:fs/promises'

@Controller('users')
export class UsersController {

    constructor(private readonly userService: UsersService) { }
    @Get()
    findAllUsers(@Query() paginationDto?: PaginationDto) {
        return this.userService.findAllUsers(paginationDto);
    }

    @Get(':id')
    findOneUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.finOneUser(id);
    }

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthTokenGuard)
    @Patch(':id')
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @TokenPayloadParam() tokenPayload: PayloadTokenDto) {
        return this.userService.updateUser(id, updateUserDto, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id: number, @TokenPayloadParam() tokenPayload: PayloadTokenDto) {
        return this.userService.deleteUser(id, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    async uploadAvatar(
        @TokenPayloadParam() tokenPayload: PayloadTokenDto,
        @UploadedFile(
            new ParseFilePipeBuilder().addFileTypeValidator({
                fileType: /jpg|jpeg|png/g,
            }).addMaxSizeValidator({
                maxSize: 5 * (1024 * 1024), 
            }).build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            })
        ) file: Express.Multer.File) {
        const fileExtension = path.extname(file.originalname).toLocaleLowerCase().substring(1)

        const fileName = `${tokenPayload.sub}.${fileExtension}`
        const fileLocale = path.resolve(process.cwd(), 'files', fileName)

        await fs.writeFile(fileLocale, file.buffer)

        return true
    }
}
