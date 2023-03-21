import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    MinLength,
    IsEmail,
} from 'class-validator';

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @ApiProperty({
        type: String,
        description: 'This field is required'
    })
    password: string

    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'This field is required'
    })
    email: string
}
