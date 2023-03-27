import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const categoryBD = await this.categoryService.findByName(createCategoryDto.category_name);
    if (categoryBD) throw new BadRequestException("Category existed!");
    const newCategory = await this.categoryService.create(createCategoryDto);
    return {
      status: HttpStatus.OK,
      message: 'Create new category success!',
      data: {
        newCategory
      }
    }
  }

  @Get()
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
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
    @Query('keyword') keyword: string) {
    const categorys = await this.categoryService.findAll({ offset: +offset, limit: +limit, keyword });
    if (categorys && categorys.length) return {
      statusCode: HttpStatus.OK,
      message: "Query categories success",
      data: {
        categorys
      }
    };
    else throw new NotFoundException("Không tìm thấy Category nào!")
  }

  @Get(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(+id);
    if (!category) throw new NotFoundException("Không tìm thấy Category có Id tương ứng!");
    return {
      status: HttpStatus.OK,
      message: "Query category success",
      data: {
        category
      }
    }
  }

  @Patch(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async update(@Param('id') id: string, @Body() updateCategoryDto: CreateCategoryDto) {
    const categoryDB = await this.categoryService.findByName(updateCategoryDto.category_name);
    if (categoryDB && categoryDB.category_id !== +id) throw new BadRequestException("Category existed!");
    const categoryUpdated = await this.categoryService.update(+id, updateCategoryDto);

    return {
      status: HttpStatus.OK,
      message: 'Update category success!',
      data: { categoryUpdated }
    }
  }

  @Delete(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async remove(@Param('id') id: string) {
    const categoryDB = await this.categoryService.findOne(+id);
    if (!categoryDB) throw new NotFoundException("Không tìm thấy category cần xóa!");
    const categoryRemoved = await this.categoryService.remove(+id);
    return {
      status: HttpStatus.OK,
      message: 'Remove category success!',
      data: {
        categoryRemoved
      }
    }
  }
}
