import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, ForbiddenException, HttpStatus, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

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
    const user = req.user;

    const userDB = await new UserService(new PrismaService).findByEmail(user.email);

    if (!user || !userDB) throw new UnauthorizedException("Vui lòng đăng nhập hệ thống");

    if (userDB.role !== "ADMIN") throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này")

    const newSkill = await this.skillService.create(createSkillDto);

    return {
      statusCode: HttpStatus.OK,
      message: "Create new skill success",
      data: {
        newSkill
      }
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
    description: 'The keyword for search skill name',
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
    const skills = await this.skillService.findAll({ offset, limit, keyword });

    return {
      statusCode: HttpStatus.OK,
      message: "Query skill success",
      data: {
        skills
      }
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
    const user = await this.skillService.findOne(+id);
    if (!user) throw new NotFoundException("Không tìm thấy Skill có Id tương ứng!")
    return {
      statusCode: HttpStatus.OK,
      message: "Query skill success",
      data: { user }
    };
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSkillDto: CreateSkillDto) {
    const updatedSkill = await this.skillService.update(+id, updateSkillDto);

    return {
      statusCode: HttpStatus.OK,
      message: "Update skill success",
      data: {
        updatedSkill
      }
    }
  }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (Number.isNaN(+id)) throw new BadRequestException("Id phải là Number!")
    const skill = await this.skillService.findOne(+id);
    if (!skill) throw new NotFoundException("Không tìm thấy Skill có Id tương ứng!")

    const removedSkill = await this.skillService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: "Remove skill success",
      data: {
        removedSkill
      }
    }
  }
}
