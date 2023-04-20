import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, HttpStatus, Req, UnauthorizedException, Query, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApiBody, ApiConsumes, ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JobImageService } from 'src/job-image/job-image.service';
import { CategoryService } from 'src/category/category.service';
import { UserService } from 'src/user/user.service';

@ApiTags("Job")
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService, private readonly jobImageService: JobImageService, private readonly categoryService: CategoryService, private readonly userService: UserService) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'Upload a job',
    type: CreateJobDto,
  })


  @UseInterceptors(FilesInterceptor('file'))
  async create(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createJobDto: CreateJobDto, @Req() req) {

    try {
      const { file: f, job_category, ...jobObject } = createJobDto;
      const user = req.user;
      const userBD = await this.userService.findByEmail(user.email);
      if (!userBD) return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Vui lòng đăng nhập hệ thống"
      }

      const category = await this.categoryService.findOne(+job_category);
      if (!category) return {
        status: HttpStatus.BAD_REQUEST,
        message: "Category không tồn tại"
      }

      const newJob = await this.jobService.create({ ...jobObject, job_price: +jobObject.job_price, job_category: +job_category, creator: userBD.user_id });

      const images = files && files.length ? files.map(file => ({ path: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, job: newJob.job_id })) : [];

      const imagesJob = await this.jobImageService.createMany(images);
      return {
        status: HttpStatus.OK,
        data: {
          newJob: {
            ...newJob,
            images: imagesJob
          }
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Get()
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiQuery({
    name: 'offset',
    description: 'The number to skip',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The size of page',
    type: String,
    required: false,
  })
  async findAll(@Query('offset') offset: number,
    @Query('limit') limit: number) {
    try {
      const jobs = await this.jobService.findAll({ offset: +offset, limit: +limit });

      const jobImagesPromises = jobs.map(j => this.jobImageService.findAllByJobId({ job: j.job_id, offset: 0, limit: 3 }));
      const jobImagesResult = await Promise.all(jobImagesPromises);

      for (const j of jobs as any) {
        for (const i of jobImagesResult) {
          if (j.job_id === i?.[0].job) {
            j.images = i;
          }
        }
      }

      return {
        status: HttpStatus.OK,
        message: "Truy vấn danh sách Job thành công",
        data: {
          jobs
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Get(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    try {
      const job = await this.jobService.findOne(+id) as any;
      const images = await this.jobImageService.findAllByJobId({ job: job.job_id, offset: 0, limit: 3 })
      job.images = images;

      return {
        status: HttpStatus.OK,
        message: "Truy vấn thông tin Job thành công",
        data: {
          job
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'Update a job',
    type: CreateJobDto,
  })
  @UseInterceptors(FilesInterceptor('file'))
  async update(@UploadedFiles() files: Array<Express.Multer.File>, @Param('id') id: string, @Body() updateJobDto: CreateJobDto, @Req() req) {
    try {
      const { file: f, job_category, ...jobObject } = updateJobDto;
      const user = req.user;
      const userBD = await this.userService.findByEmail(user.email);
      if (!userBD) return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Vui lòng đăng nhập vào hệ thống"
      }

      if (job_category) {
        const category = await this.categoryService.findOne(+job_category);
        if (!category) return {
          status: HttpStatus.BAD_REQUEST,
          message: "Category không tồn tại"
        }
      }

      const jobDB = await this.jobService.findOne(+id);
      if (!jobDB) return {
        status: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Job cần cập nhật thông tin"
      }

      if (jobDB.creator !== userBD.user_id) return {
        status: HttpStatus.FORBIDDEN,
        message: "Bạn không có quyền thực hiện thao tác này"
      }

      const images = files && files.length ? files.map(file => ({ path: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, job: +id })) : [];

      //delete old
      const imagesDB = await this.jobImageService.removeManyByJobId(+id);

      //add new
      const updatedImagesJob = await this.jobImageService.createMany(images);
      const updatedJob = await this.jobService.update(+id, { ...jobObject, job_price: +jobObject.job_price, job_category: +job_category, creator: userBD.user_id }) as any;
      updatedJob.images = updatedImagesJob;

      return {
        status: HttpStatus.OK,
        message: "Cập nhật thông tin Job thành công",
        data: {
          updatedJob
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Delete(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async remove(@Param('id') id: string, @Req() req) {
    try {
      const jobDB = await this.jobService.findOne(+id);
      if (!jobDB) return {
        status: HttpStatus.NOT_FOUND,
        message: "Không tìm thấy Job có Id tương ứng"
      }

      const user = req.user;
      const userBD = await this.userService.findByEmail(user.email);
      if (jobDB.creator !== userBD.user_id) return {
        status: HttpStatus.FORBIDDEN,
        message: "Bạn không có quyền thực hiện thao tác này"
      }

      const images = await this.jobImageService.removeManyByJobId(+id);
      const job = await this.jobService.remove(+id)
      return {
        status: HttpStatus.OK,
        message: "Xóa Job thành công",
        data: {
          images,
          job
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
