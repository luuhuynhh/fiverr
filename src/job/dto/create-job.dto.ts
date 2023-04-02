import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateJobDto {
    @ApiPropertyOptional({
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'Upload job images',
        minItems: 0
    })
    @IsOptional()
    file?: any[];

    @ApiProperty()
    job_name: string

    @ApiPropertyOptional()
    @IsOptional()
    job_description?: string

    @ApiProperty()
    job_price: number

    @ApiProperty()
    job_category: number
}
