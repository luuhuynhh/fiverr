import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) { }
  create(createJobDto: any) {
    return this.prisma.job.create({
      data: createJobDto
    })
  }

  findAll({ offset, limit }: { offset: number, limit: number }) {
    return this.prisma.job.findMany({
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      orderBy: [{ job_id: 'desc' }]
    })
  }

  findOne(id: number) {
    return this.prisma.job.findFirst({
      where: {
        job_id: id
      }
    })
  }

  update(id: number, updateJobDto: any) {
    return this.prisma.job.update({
      where: {
        job_id: id
      },
      data: updateJobDto
    })
  }

  remove(id: number) {
    return this.prisma.job.delete({
      where: {
        job_id: id
      }
    })
  }
}
