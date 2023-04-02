import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobImageService } from 'src/job-image/job-image.service';
import { CategoryService } from 'src/category/category.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [JobController],
  providers: [JobService, JobImageService, CategoryService, UserService],
  imports: [PrismaModule]
})
export class JobModule { }
