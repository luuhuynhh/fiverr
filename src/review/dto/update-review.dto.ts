import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
    @ApiPropertyOptional({
        type: String,
        description: 'content / comment'
    })
    content?: string

    @ApiPropertyOptional({
        type: Number,
        description: 'star from 1 to 5'
    })
    star?: number
}
