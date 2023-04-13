import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHireJobDto, STATUS } from './create-hire_job.dto';

export class UpdateHireJobDto {
    @ApiProperty({
        type: Boolean,
        required: false
    })
    is_solved?: boolean

    @ApiProperty({
        type: String,
        required: false
    })
    status?: STATUS
}
