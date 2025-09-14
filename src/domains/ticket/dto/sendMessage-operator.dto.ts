import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MinLength } from 'class-validator';

export class sendMessageOperatorSubmitDto {
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    body: string;

    @ApiProperty()
    @IsNotEmpty()
    operatorId: string;

   // @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    ticketId: string;
}

export class sendMessageOperatorResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
