import { Injectable } from '@nestjs/common';
import { CreateHireJobDto, STATUS } from './dto/create-hire_job.dto';
import { UpdateHireJobDto } from './dto/update-hire_job.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HireJobService {
  constructor(private readonly prisma: PrismaService) { }
  create(createHireJobDto) {
    return this.prisma.hire_job.create({
      data: createHireJobDto
    })
  }

  findAll({ offset, limit, is_solved, status }: { offset: number, limit: number, is_solved: boolean, status: STATUS }) {
    return this.prisma.hire_job.findMany({
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      where: {
        ...(is_solved !== undefined && { is_solved: is_solved }),
        ...(status && { status: status })
      },

      orderBy: [{ id: 'desc' }]
    })
  }

  findOne(id: number) {
    return this.prisma.hire_job.findFirst({
      where: {
        id
      }
    })
  }

  findByJobAndEmployee({ job, employee }: { job: number, employee: number }) {
    return this.prisma.hire_job.findFirst({
      where: {
        job,
        employee
      }
    })
  }

  update(id: number, updateHireJobDto: UpdateHireJobDto) {
    return this.prisma.hire_job.update({
      data: updateHireJobDto,
      where: {
        id: id
      }
    })
  }

  remove(id: number) {
    return this.prisma.hire_job.delete({
      where: {
        id
      }
    })
  }
}
