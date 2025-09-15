import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class addoperatorSubmitDto {
   // @ApiProperty()
    @IsString()
    operatorId: string;

   // @ApiProperty()
    @IsString()
    operatorName: string;
}

export class addoperatorResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
