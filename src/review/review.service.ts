import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }
  create(createReviewDto: any) {
    return this.prisma.review.create({
      data: createReviewDto
    })
  }

  findAll(query: any) {
    let { offset, limit, keyword, star_from, star_to, job } = query;
    return this.prisma.review.findMany({
      where: {
        ...(keyword && {
          content: {
            contains: keyword
          }
        }),
        ...(star_from && { star: { gte: star_from } }),
        ...(star_to && { star: { lte: star_to } }),
        ...(job && { job: job }),
      },
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      orderBy: { review_id: 'desc' }
    })
  }

  findOne(id: number) {
    return this.prisma.review.findFirst({
      where: {
        review_id: id
      }
    })
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.prisma.review.update({
      data: updateReviewDto,
      where: {
        review_id: id
      }
    })
  }

  remove(id: number) {
    return this.prisma.review.delete({
      where: {
        review_id: id
      }
    })
  }
}
