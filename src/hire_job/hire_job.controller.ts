import { Controller, Get, Post, Body, Patch, Param, Delete, Req, BadRequestException, HttpStatus, UnauthorizedException, Query, NotFoundException, ParseBoolPipe, InternalServerErrorException } from '@nestjs/common';
import { HireJobService } from './hire_job.service';
import { CreateHireJobDto, STATUS } from './dto/create-hire_job.dto';
import { UpdateHireJobDto } from './dto/update-hire_job.dto';
import { ApiBody, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { JobService } from 'src/job/job.service';

@ApiTags("Hire Job")
@Controller('hire-job')
export class HireJobController {
  constructor(private readonly hireJobService: HireJobService, private readonly userService: UserService, private readonly jobService: JobService) { }

  @Post()
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'Request a hire job',
    type: CreateHireJobDto,
  })
  async create(@Body() createHireJobDto: CreateHireJobDto, @Req() req) {
    try {
      const user = req.user;
      const userDB = await this.userService.findByEmail(user.email);
      if (!userDB) throw new UnauthorizedException("Vui lòng đăng nhập vào hệ thống")

      const jobDB = await this.jobService.findOne(+createHireJobDto.job);
      if (!jobDB) throw new BadRequestException("Không tìm thấy Job với Id tương ứng");

      const newRequest = await this.hireJobService.create({ ...createHireJobDto, job: +createHireJobDto.job, employee: userDB.user_id, hire_date: new Date(), is_solved: false });

      return {
        status: HttpStatus.OK,
        message: "Gửi yêu cầu hire job thành công",
        data: {
          newRequest
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
  @ApiQuery({
    name: 'is_solved',
    description: 'The request is solved?',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'The status of request: REJECT / RESOLVE',
    type: String,
    required: false,
  })
  async findAll(@Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('is_solved') is_solved: boolean,
    @Query('status') status: STATUS,
    @Query('employee') employee: number,
    @Query('job') job: number,
    @Query('from_date') from_date: Date,
    @Query('to_date') to_date: Date) {
    try {
      if (is_solved) is_solved = is_solved + '' === 'true' ? true : false;
      const hireJobs = await this.hireJobService.findAll({ offset: +offset, limit: +limit, is_solved, status, employee: +employee, job: +job, from_date: from_date ? new Date(from_date) : null, to_date: to_date ? new Date(to_date) : null });

      if (!hireJobs || !hireJobs.length) throw new NotFoundException("Không tìm thấy hire job nào")

      return {
        status: HttpStatus.OK,
        message: "Truy vấn danh sách hire job thành công",
        data: {
          hireJobs
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
      const hireJob = await this.hireJobService.findOne(+id);
      if (!hireJob) throw new NotFoundException("Không tìm thấy hire job ứng với Id")

      return {
        status: HttpStatus.OK,
        message: "Truy vấn thông tin hire job thành công",
        data: {
          hireJob
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  @Patch(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  @ApiBody({
    description: 'HireJob',
    type: UpdateHireJobDto
  })
  async update(@Param('id') id: string, @Body() updateHireJobDto: UpdateHireJobDto, @Body('is_solved', ParseBoolPipe) is_solved: boolean) {
    try {
      const updatedHireJob = await this.hireJobService.update(+id, { ...updateHireJobDto, is_solved });

      return {
        status: HttpStatus.OK,
        message: "Cập nhật thông tin HireJob thành công",
        data: {
          updatedHireJob
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
  async remove(@Param('id') id: string) {
    try {
      const hireJobDB = await this.hireJobService.findOne(+id);
      if (!hireJobDB) throw new BadRequestException("Không tìm thấy hire job cần xóa")

      const removedHireJob = await this.hireJobService.remove(+id);
      return {
        status: HttpStatus.OK,
        message: "Xóa hire job thành công",
        data: {
          removedHireJob
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
