import { Controller, Get, Post, Body, Patch, Param, Delete, Req, BadRequestException, HttpStatus, UnauthorizedException, Query, NotFoundException, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
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
    const user = req.user;
    const userDB = await this.userService.findByEmail(user.email);
    if (!userDB) throw new UnauthorizedException("Please login to use system")

    const jobDB = await this.jobService.findOne(+createHireJobDto.job);
    if (!jobDB) throw new BadRequestException("Job doesn't exist");

    const newRequest = await this.hireJobService.create({ ...createHireJobDto, job: +createHireJobDto.job, employee: userDB.user_id, hire_date: new Date(), is_solved: false });

    return {
      status: HttpStatus.OK,
      data: {
        newRequest
      }
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
    @Query('is_solved', ParseBoolPipe) is_solved: boolean,
    @Query('status') status: STATUS) {
    const hireJobs = await this.hireJobService.findAll({ offset: +offset, limit: +limit, is_solved, status });

    return {
      status: HttpStatus.OK,
      data: {
        hireJobs
      }
    }
  }

  @Get(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    const hireJob = await this.hireJobService.findOne(+id);
    if (!hireJob) throw new NotFoundException("Hire Job not found")

    return {
      status: HttpStatus.OK,
      data: {
        hireJob
      }
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
  update(@Param('id') id: string, @Body() updateHireJobDto: UpdateHireJobDto, @Body('is_solved', ParseBoolPipe) is_solved: boolean) {
    return this.hireJobService.update(+id, { ...updateHireJobDto, is_solved });
  }

  @Delete(':id')
  @ApiHeader({
    name: 'accessToken',
    description: 'Bearer token',
    required: true,
  })
  async remove(@Param('id') id: string) {
    const hireJobDB = await this.hireJobService.findOne(+id);
    if (!hireJobDB) throw new BadRequestException("Hire Job doesn't exist")

    const removedHireJob = await this.hireJobService.remove(+id);
    return {
      status: HttpStatus.OK,
      data: {
        removedHireJob
      }
    }
  }
}
