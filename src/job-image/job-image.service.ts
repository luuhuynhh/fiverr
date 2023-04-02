import { Injectable } from '@nestjs/common';
import { CreateJobImageDto } from './dto/create-job-image.dto';
import { UpdateJobImageDto } from './dto/update-job-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobImageService {
  constructor(private readonly prisma: PrismaService) { }
  async createMany(createJobImageDtos: CreateJobImageDto[]) {
    return this.prisma.job_image.createMany({
      data: createJobImageDtos
    })
  }

  findAll({ offset, limit }: { offset: number, limit: number }) {
    return this.prisma.job_image.findMany({
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      orderBy: [{ image_id: 'desc' }]
    })
  }

  findAllByJobId({ job, offset, limit }: { job: number, offset: number, limit: number }) {
    return this.prisma.job_image.findMany({
      where: {
        job
      },
      ...(offset && { skip: offset }),
      ...(limit && { take: limit }),
      orderBy: [{ image_id: 'desc' }]
    })
  }

  findOne(id: number) {
    return this.prisma.job_image.findFirst({
      where: {
        image_id: id
      }
    })
  }

  update(id: number, updateJobImageDto: UpdateJobImageDto) {
    return `This action updates a #${id} jobImage`;
  }

  remove(id: number) {
    return this.prisma.job_image.delete({
      where: {
        image_id: id
      }
    })
  }

  removeManyByJobId(job: number) {
    return this.prisma.job_image.deleteMany({
      where: {
        job
      }
    })
  }
}
