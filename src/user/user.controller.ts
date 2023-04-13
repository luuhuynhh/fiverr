import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, Query, NotFoundException, UseInterceptors, UploadedFile, FileTypeValidator, ParseFilePipe, HttpStatus, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiHeader, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { generateAccessToken, hashPassword } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';


@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**for auth */
  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const userDB = await this.userService.findByEmail(createUserDto.email)
    if (userDB) throw new BadRequestException("Email was registered account")

    const hashedPassword = await hashPassword(createUserDto.password);
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return {
      statusCode: HttpStatus.OK,
      message: "Create user success",
      data: {
        newUser
      }
    }
  }

  @Post('signin')
  async login(@Body() user: LoginUserDto): Promise<any> {
    const foundUser = await this.userService.findByEmail(user.email);
    if (foundUser && await bcrypt.compare(user.password, foundUser.password)) {
      const token = await generateAccessToken(foundUser);
      return {
        statusCode: HttpStatus.OK,
        message: "Login success",
        access_token: token
      }
    }
    throw new BadRequestException("Invalid login information");
  }
  /**end auth */


  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Get()
  @ApiQuery({
    name: 'keyword',
    description: 'The keyword for search name',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'The number to skip',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The size of page',
    type: String,
    required: false,
  })
  async findAll(@Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('keyword') keyword: string
  ) {
    const users: CreateUserDto[] = await this.userService.findAll({ offset, limit, keyword });
    if (users && users.length) return {
      statusCode: HttpStatus.OK,
      message: "Query users success",
      data: {
        users
      }
    };
    else throw new NotFoundException("Không tìm thấy User nào!")
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
    const user = await this.userService.findOne(+id);
    if (!user) throw new NotFoundException("Không tìm thấy User có Id tương ứng!")
    return {
      statusCode: HttpStatus.OK,
      message: "Query user success",
      data: { user }
    };
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")

    const user = await this.userService.findByEmail(req.user.email);
    if (user.user_id !== +id && user.role !== "ADMIN") {
      throw new ForbiddenException("Bạn không có quyền")
    }

    const userDB = await this.userService.findOne(+id);
    if (!userDB) throw new BadRequestException("User không tồn tại trong hệ thống!");

    const userUpdated = await this.userService.update(+id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Update user success",
      data: {
        userUpdated
      }
    };
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")

    const user = await this.userService.findByEmail(req.user.email);
    if (user.user_id !== +id && user.role !== "ADMIN") {
      throw new ForbiddenException("Bạn không có quyền")
    }

    const userDB = await this.userService.findOne(+id);
    if (!userDB) throw new BadRequestException("User không tồn tại trong hệ thống!");

    const userRemoved = await this.userService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: "Remove user success",
      data: {
        userRemoved
      }
    };
  }

  @Post('upload-avatar')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'Upload a job',
    type: UploadFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: 'image/*' }),
      ],
    }),
  ) file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException("Upload image failed!");

    const path = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const curUser = await this.userService.findByEmail(req.user.email);

    if (!curUser) throw new UnauthorizedException("Vui lòng đăng nhập hệ thống");
    const updatedUser = await this.userService.updateAvatar(curUser.user_id, path)

    return {
      statusCode: HttpStatus.OK,
      message: "Upload avatar success",
      data: {
        updatedUser
      }
    }
  }

}
