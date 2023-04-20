import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, Query, NotFoundException, UseInterceptors, UploadedFile, FileTypeValidator, ParseFilePipe, HttpStatus, ForbiddenException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiHeader, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { generateAccessToken, hashPassword } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { ROLE } from 'src/config';


@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**for auth */
  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const userDB = await this.userService.findByEmail(createUserDto.email)
      if (userDB) throw new BadRequestException("Email đã được đăng ký, vui lòng chọn đăng nhập")

      const hashedPassword = await hashPassword(createUserDto.password);
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Thêm User thành công",
        data: {
          newUser
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Post('signin')
  async login(@Body() user: LoginUserDto): Promise<any> {
    try {
      const foundUser = await this.userService.findByEmail(user.email);
      if (foundUser && await bcrypt.compare(user.password, foundUser.password)) {
        const token = await generateAccessToken(foundUser);
        return {
          statusCode: HttpStatus.OK,
          message: "Đăng nhập thành công",
          access_token: token
        }
      }
      throw new BadRequestException("Thông tin đăng nhập không hợp lệ");
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
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
    description: 'Keyword for search user\'s name',
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
    try {
      const users: CreateUserDto[] = await this.userService.findAll({ offset, limit, keyword });
      if (users && users.length) return {
        statusCode: HttpStatus.OK,
        message: "Truy vấn danh sách User thành công",
        data: {
          users
        }
      };
      else throw new NotFoundException("Không tìm thấy User nào!")
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
      const user = await this.userService.findOne(+id);
      if (!user) throw new NotFoundException("Không tìm thấy User có Id tương ứng!")
      return {
        statusCode: HttpStatus.OK,
        message: "Truy vấn chi tiết User thành công",
        data: { user }
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")

      const user = await this.userService.findByEmail(req.user.email);
      if (user.user_id !== +id && user.role !== ROLE.ADMIN) {
        throw new ForbiddenException("Bạn không có quyền")
      }

      const userDB = await this.userService.findOne(+id);
      if (!userDB) throw new BadRequestException("User không tồn tại trong hệ thống!");

      const userUpdated = await this.userService.update(+id, updateUserDto);
      return {
        statusCode: HttpStatus.OK,
        message: "Cập nhật thông tin User thành công",
        data: {
          userUpdated
        }
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")

      const user = await this.userService.findByEmail(req.user.email);
      if (user.user_id !== +id && user.role !== ROLE.ADMIN) {
        throw new ForbiddenException("Bạn không có quyền")
      }

      const userDB = await this.userService.findOne(+id);
      if (!userDB) throw new BadRequestException("User không tồn tại trong hệ thống!");

      const userRemoved = await this.userService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: "Xóa User thành công",
        data: {
          userRemoved
        }
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Post('upload-avatar')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'Upload avatar',
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
    try {
      if (!file) throw new BadRequestException("Thêm ảnh không thành công");

      const path = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const curUser = await this.userService.findByEmail(req.user.email);

      if (!curUser) throw new UnauthorizedException("Vui lòng đăng nhập hệ thống");
      const updatedUser = await this.userService.updateAvatar(curUser.user_id, path)

      return {
        statusCode: HttpStatus.OK,
        message: "Cập nhật avatar thành công",
        data: {
          updatedUser
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

}
