import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class addSystemSubmitDto {
    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    password: string;

    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    userName: string;

    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    systemName: string;

    @ApiProperty()
    @IsNotEmpty()
    adminId:string

}

export class addSystemResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
