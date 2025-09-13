import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength } from 'class-validator';

export class checkSystemSubmitDto {
    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    password: string;

    @ApiProperty()
    @MinLength(5)
    @MaxLength(50)
    userName: string;
}

export class checkSystemResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
