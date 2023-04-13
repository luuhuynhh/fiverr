import { ApiProperty } from "@nestjs/swagger";

export class CreateHireJobDto {
    @ApiProperty({
        type: Number
    })
    job: number
}

export enum STATUS {
    REJECT = 'reject',
    RESOLVE = 'resolve'
}
