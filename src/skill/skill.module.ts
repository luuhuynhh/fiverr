import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SkillController],
  providers: [SkillService],
  imports: [PrismaModule]
})
export class SkillModule { }
