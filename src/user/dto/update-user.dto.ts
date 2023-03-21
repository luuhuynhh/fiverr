import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    full_name?: string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    password?: string

    @IsEmail()
    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    email?: string

    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    phone?: string

    @IsOptional()
    @ApiPropertyOptional({
        type: Date,
        description: 'This field is optional'
    })
    birthday?: Date

    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    gender?: string

    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    role?: string

    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        description: 'This field is optional'
    })
    skills?: string
}
