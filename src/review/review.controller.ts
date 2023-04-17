import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, HttpStatus, Query, NotFoundException } from '@nestjs/common';
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
    const user = req.user;
    const userDB = await this.userService.findByEmail(user.email);
    if (!userDB) throw new UnauthorizedException("Please login to use system")
    const newReview = await this.reviewService.create({ ...createReviewDto, author: userDB.user_id, job: +createReviewDto.job, review_date: new Date(), star: +createReviewDto.star });

    return {
      status: HttpStatus.OK,
      data: {
        newReview
      },
      message: "Create review success"
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
  async findAll(@Query() query) {
    let { offset, limit, keyword, star_from, star_to } = query;
    offset = +offset || 0;
    limit = +limit || 0
    star_from = +star_from || 0
    star_to = +star_to || 0
    const reviews = await this.reviewService.findAll({ offset, limit, keyword, star_from, star_to });

    if (!reviews || !reviews.length) throw new NotFoundException("Không tìm thấy reviews nào");

    return {
      status: HttpStatus.OK,
      message: "Truy vấn danh sách reviews thành công",
      data: {
        reviews
      }
    }
  }

  @Get(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    const review = await this.reviewService.findOne(+id);

    return {
      status: HttpStatus.OK,
      data: {
        review
      },
      message: 'Get review detail success'
    }
  }

  @Patch(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: "Update review (only content and star",
    type: UpdateReviewDto
  })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    const updatedReview = await this.reviewService.update(+id, { ...updateReviewDto, ...(updateReviewDto.star && { star: +updateReviewDto.star }) });
    return {
      status: HttpStatus.OK,
      message: "Updated review",
      data: {
        updatedReview
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const review = await this.reviewService.remove(+id);

    return {
      status: HttpStatus.OK,
      data: {
        review
      },
      messahe: "Removed review"
    }
  }
}
