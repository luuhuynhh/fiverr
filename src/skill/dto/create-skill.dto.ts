import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateSkillDto {
    @ApiProperty()
    @IsNotEmpty()

    skill_name: string
}
