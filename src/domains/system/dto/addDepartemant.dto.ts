import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class addDepartemanSubmitDto {
    @ApiProperty({
        description: 'Title of the department',
        example: 'Human Resources',
    })
    @IsString()
    @IsNotEmpty({ message: 'Title should not be empty' })
    title: string;
}

export class addDepartemanResponseDto {
    @ApiProperty() addDepartemanResponseDto;
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
