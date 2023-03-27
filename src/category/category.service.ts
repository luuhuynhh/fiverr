import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Skill } from 'src/skill/entities/skill.entity';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }
  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({ data: createCategoryDto })
  }

  findAll({ offset, limit, keyword }) {
    return this.prisma.category.findMany({
      where: {
        ...(keyword && {
          category_name: {
            contains: keyword
          }
        })
      },
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      orderBy: { category_id: 'desc' }
    })
  }

  findOne(id: number) {
    return this.prisma.category.findFirst({
      where: {
        category_id: id
      }
    })
  }

  findByName(name: string) {
    return this.prisma.category.findFirst({
      where: {
        category_name: name
      }
    })
  }

  update(id: number, updateCategoryDto: CreateCategoryDto) {
    return this.prisma.category.update({
      where: {
        category_id: id
      },
      data: updateCategoryDto
    })
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: {
        category_id: id
      }
    })
  }
}
