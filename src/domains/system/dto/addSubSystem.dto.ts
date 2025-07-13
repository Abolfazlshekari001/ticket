import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class addSubSystemSubmitDto {
    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    name: string;

    @ApiProperty()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    referenceId: string;

    @ApiProperty()
    @IsNotEmpty()
    adminId: string;
}

export class addSubSystemResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
