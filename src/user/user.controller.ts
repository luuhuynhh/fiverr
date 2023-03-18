import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, HttpCode, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiCreatedResponse, ApiUnprocessableEntityResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { generateAccessToken, hashPassword } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**for auth */
  @Post('signup')
  @ApiCreatedResponse({ description: 'Created Succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  async create(@Body() createUserDto: CreateUserDto) {
    const userDB = await this.userService.findByEmail(createUserDto.email)
    if (userDB) throw new BadRequestException("Email was registered account")

    const hashedPassword = await hashPassword(createUserDto.password);
    return this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  @Post('signin')
  @ApiCreatedResponse({ description: 'Login Succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  async login(@Body() user: LoginUserDto): Promise<{ access_token: string }> {
    const foundUser = await this.userService.findByEmail(user.email);
    if (foundUser && await bcrypt.compare(user.password, foundUser.password)) {
      const token = await generateAccessToken(foundUser);
      return { access_token: token };
    }
    throw new BadRequestException("Invalid login information");
  }
  /**end auth */

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
