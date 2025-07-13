import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MinLength } from 'class-validator';

export class sendMessageUserSubmitDto {
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    body: string;

    @ApiProperty()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    ticketId: string;
}

export class sendMessageUserResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
