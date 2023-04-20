import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpStatus, Query, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
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
    try {
      const categoryBD = await this.categoryService.findByName(createCategoryDto.category_name);
      if (categoryBD) throw new BadRequestException("Category đã tồn tại!");
      const newCategory = await this.categoryService.create(createCategoryDto);
      return {
        status: HttpStatus.OK,
        message: 'Thêm category thành công',
        data: {
          newCategory
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
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
    description: 'Keyword for search category\'s name',
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
      const categorys = await this.categoryService.findAll({ offset: +offset, limit: +limit, keyword });
      if (categorys && categorys.length) return {
        statusCode: HttpStatus.OK,
        message: "Truy vấn danh sách category thành công",
        data: {
          categorys
        }
      };

      else return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Category nào"
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Get(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoryService.findOne(+id);
      if (!category) return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Category có Id tương ứng"
      }

      return {
        status: HttpStatus.OK,
        message: "Try vấn thông tin category thành công",
        data: {
          category
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Patch(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async update(@Param('id') id: string, @Body() updateCategoryDto: CreateCategoryDto) {
    try {
      const categoryDB = await this.categoryService.findByName(updateCategoryDto.category_name);
      if (categoryDB && categoryDB.category_id !== +id) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Category đã tồn tại"
      }
      const categoryUpdated = await this.categoryService.update(+id, updateCategoryDto);

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật category thành công!',
        data: { categoryUpdated }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Delete(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async remove(@Param('id') id: string) {
    try {
      const categoryDB = await this.categoryService.findOne(+id);
      if (!categoryDB) return {
        status: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Category cần xóa"
      }
      const categoryRemoved = await this.categoryService.remove(+id);
      return {
        status: HttpStatus.OK,
        message: 'Xóa category thành công',
        data: {
          categoryRemoved
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
