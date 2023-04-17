import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReviewDto {
    @ApiProperty({
        type: Number,
        description: 'Job Id'
    })
    job: number

    @ApiPropertyOptional({
        type: String,
        description: 'content / comment'
    })
    content?: string

    @ApiProperty({
        type: Number,
        description: 'star from 1 to 5'
    })
    star: number
}
