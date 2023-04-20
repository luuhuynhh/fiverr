import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, HttpStatus, Query, NotFoundException, BadRequestException, InternalServerErrorException, Response } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService, private readonly userService: UserService) { }

  @Post()
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    type: CreateReviewDto
  })
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    try {
      const user = req.user;
      const userDB = await this.userService.findByEmail(user.email);
      if (!userDB) return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Vui lòng đăng nhập hệ thống"
      }
      const newReview = await this.reviewService.create({ ...createReviewDto, author: userDB.user_id, job: +createReviewDto.job, review_date: new Date(), star: +createReviewDto.star });

      return {
        status: HttpStatus.OK,
        data: {
          newReview
        },
        message: "Thêm review thành công"
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Get()
  @Get()
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
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
  @ApiQuery({
    name: 'keyword',
    description: 'Find review by content',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'star_from',
    description: 'Minimum star',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'star_to',
    description: 'Maximum star',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'job',
    description: 'Job Id',
    type: Number,
    required: false,
  })
  async findAll(@Query() query) {
    try {
      let { offset, limit, keyword, star_from, star_to, job } = query;
      offset = +offset || 0;
      limit = +limit || 0
      star_from = +star_from || 0
      star_to = +star_to || 0
      job = +job || undefined
      const reviews = await this.reviewService.findAll({ offset, limit, keyword, star_from, star_to, job });

      if (!reviews || !reviews.length) return {
        status: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy reviews nào"
      }

      return {
        status: HttpStatus.OK,
        message: "Truy vấn danh sách Review thành công",
        data: {
          reviews
        }
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
      if (Number.isNaN(+id)) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Id phải là Number"
      }

      const review = await this.reviewService.findOne(+id);

      if (!review) return {
        status: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Review có Id tương ứng"
      }

      return {
        status: HttpStatus.OK,
        data: {
          review
        },
        message: 'Truy vấn thông tin Review thành công'
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
  @ApiBody({
    description: "Update review (only content and star)",
    type: UpdateReviewDto
  })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    try {
      if (Number.isNaN(+id)) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Id phải là number"
      }
      const reviewBD = await this.reviewService.findOne(+id);
      if (!reviewBD) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Không tìm thấy Review cần cập nhật thông tin"
      }

      const updatedReview = await this.reviewService.update(+id, { ...updateReviewDto, ...(updateReviewDto.star && { star: +updateReviewDto.star }) });

      return {
        status: HttpStatus.OK,
        message: "Cập nhật thông tin review thành công",
        data: {
          updatedReview
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      if (Number.isNaN(+id)) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Id phải là Number"
      }

      const reviewBD = await this.reviewService.findOne(+id);
      if (!reviewBD) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Không tìm thấy review cần xóa"
      }

      const review = await this.reviewService.remove(+id);

      return {
        status: HttpStatus.OK,
        data: {
          review
        },
        messahe: "Xóa review thành công"
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
