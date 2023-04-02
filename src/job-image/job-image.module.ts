import { Module } from '@nestjs/common';
import { JobImageService } from './job-image.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [JobImageService],
  imports: [PrismaModule]
})
export class JobImageModule { }
