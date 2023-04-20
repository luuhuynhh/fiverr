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

  findAll({ offset, limit, is_solved, status, employee, job, from_date, to_date }: { offset: number, limit: number, is_solved: boolean, status: STATUS, employee: number, job: number, from_date: Date, to_date: Date }) {
    return this.prisma.hire_job.findMany({
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      where: {
        ...(is_solved !== undefined && { is_solved: is_solved }),
        ...(status && { status: status }),
        ...(employee && { employee: employee }),
        ...(job && { job: job }),
        ...(from_date && { hire_date: { gte: from_date } }),
        ...(to_date && { hire_date: { lte: to_date } }),
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
