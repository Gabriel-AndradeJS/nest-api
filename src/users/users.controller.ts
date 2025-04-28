import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { request } from 'express';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

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
}
