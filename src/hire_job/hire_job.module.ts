import { Module } from '@nestjs/common';
import { HireJobService } from './hire_job.service';
import { HireJobController } from './hire_job.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';
import { JobService } from 'src/job/job.service';

@Module({
  controllers: [HireJobController],
  providers: [HireJobService, UserService, JobService],
  imports: [PrismaModule]
})
export class HireJobModule { }
