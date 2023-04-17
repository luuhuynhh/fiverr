import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, UserService],
  imports: [PrismaModule]
})
export class ReviewModule { }
