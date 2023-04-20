import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, ForbiddenException, HttpStatus, Query, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLE } from 'src/config';

@ApiTags("Skill")
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) { }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Post()
  async create(@Req() req, @Body() createSkillDto: CreateSkillDto) {
    try {
      const user = req.user;

      const userDB = await new UserService(new PrismaService).findByEmail(user.email);

      if (!user || !userDB) throw new UnauthorizedException("Vui lòng đăng nhập hệ thống");

      if (userDB.role !== ROLE.ADMIN) throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này")

      const skillDB = await this.skillService.findByName(createSkillDto.skill_name);
      if (skillDB) throw new BadRequestException("Tên skill đã tồn tại!");

      const newSkill = await this.skillService.create(createSkillDto);

      return {
        statusCode: HttpStatus.OK,
        message: "Thêm skill thành công",
        data: {
          newSkill
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Get()
  @ApiQuery({
    name: 'keyword',
    description: 'Keyword for search skill\'s name',
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
    @Query('keyword') keyword: string) {
    try {
      const skills = await this.skillService.findAll({ offset, limit, keyword });

      return {
        statusCode: HttpStatus.OK,
        message: "Truy vấn danh sách Skill thành công",
        data: {
          skills
        }
      }
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
  async findOne(@Param('id') id: string) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
      const user = await this.skillService.findOne(+id);
      if (!user) throw new NotFoundException("Không tìm thấy Skill có Id tương ứng!")
      return {
        statusCode: HttpStatus.OK,
        message: "Truy vấn chi tiết Skill thành công",
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
  async update(@Param('id') id: string, @Body() updateSkillDto: CreateSkillDto) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")

      const thisSkillDB = await this.skillService.findOne(+id);
      if (!thisSkillDB) throw new BadRequestException("Không tìm thấy Skill cần cập nhật");

      const skillDB = await this.skillService.findByName(updateSkillDto.skill_name);
      if (skillDB && skillDB.skill_id !== +id) throw new BadRequestException("Tên Skill đã tồn tại");

      const updatedSkill = await this.skillService.update(+id, updateSkillDto);

      return {
        statusCode: HttpStatus.OK,
        message: "Cập nhật thông tin Skill thành công",
        data: {
          updatedSkill
        }
      }
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
  async remove(@Param('id') id: string) {
    try {
      if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
      const skill = await this.skillService.findOne(+id);
      if (!skill) throw new NotFoundException("Không tìm thấy Skill có Id tương ứng!")

      const removedSkill = await this.skillService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: "Xóa skill thành công",
        data: {
          removedSkill
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
