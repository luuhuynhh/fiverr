import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobImageService } from './job-image.service';
import { CreateJobImageDto } from './dto/create-job-image.dto';
import { UpdateJobImageDto } from './dto/update-job-image.dto';

@Controller('job-image')
export class JobImageController {
  constructor(private readonly jobImageService: JobImageService) { }

  @Post()
  create(@Body() createJobImageDto: CreateJobImageDto) {
    // return this.jobImageService.create(createJobImageDto);
  }

  @Get()
  findAll() {
    // return this.jobImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobImageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobImageDto: UpdateJobImageDto) {
    return this.jobImageService.update(+id, updateJobImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobImageService.remove(+id);
  }
}
