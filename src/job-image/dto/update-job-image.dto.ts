import { PartialType } from '@nestjs/swagger';
import { CreateJobImageDto } from './create-job-image.dto';

export class UpdateJobImageDto extends PartialType(CreateJobImageDto) {}
