import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { REQUEST_TOKEN_PAYLOAD_NAME } from 'src/auth/common/auth.constants';

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
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.deleteUser(id);
    }
}
