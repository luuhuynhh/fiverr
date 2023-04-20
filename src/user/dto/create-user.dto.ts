import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsEmail,
    IsPhoneNumber
} from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'This field is required'
    })
    full_name: string

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

    @ApiProperty({
        type: String,
        description: 'This field is required'
    })
    phone: string

    @ApiPropertyOptional({
        type: Date,
        description: 'This field is optional'
    })
    birthday: Date

    @ApiPropertyOptional({
        type: String,
        description: 'This field is required'
    })
    gender: string

    @ApiProperty({
        type: String,
        description: 'This field is required'
    })
    role: string

    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    skills?: string
}
