import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) { }
  create(createSkillDto: CreateSkillDto) {
    return this.prisma.skill.create({ data: createSkillDto })
  }

  findAll({ offset, limit, keyword }) {
    return this.prisma.skill.findMany({
      where: {
        ...(keyword && {
          skill_name: {
            contains: keyword
          }
        })
      },
      ...(offset && { skip: parseInt(offset) }),
      ...(limit && { take: parseInt(limit) }),
      orderBy: { skill_id: 'desc' }
    })
  }

  findOne(id: number) {
    return this.prisma.skill.findFirst({
      where: {
        skill_id: id
      }
    })
  }

  update(id: number, updateSkillDto: CreateSkillDto) {
    return this.prisma.skill.update({
      data: {
        ...updateSkillDto
      },
      where: {
        skill_id: id
      }
    })
  }

  remove(id: number) {
    return this.prisma.skill.delete({
      where: {
        skill_id: id
      }
    })
  }

  findByName(skill_name: string) {
    skill_name = skill_name.toLowerCase();
    return this.prisma.skill.findFirst({
      where: {
        skill_name
      }
    })
  }
}
