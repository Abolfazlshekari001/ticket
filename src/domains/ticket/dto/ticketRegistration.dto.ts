import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength, IsUUID, IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { priorirtyType } from '../entity/enum/priorirtyType.enum';

export class TicketRegistrationSubmitDto {
    @ApiProperty()
    @IsOptional()
    departmentId: string;

    @ApiProperty()
    @IsOptional()
    priorirty: priorirtyType;

    @ApiProperty()
    @IsOptional()
    title: string;

    @IsString({ message: 'نام باید یک رشته باشد' })
    @IsOptional()
    @ApiProperty({
        description: 'نام کامل نماینده',
        example: 'John Doe',
        required: true,
    })
    name: string;

    @ApiProperty()
    @IsOptional()
    body: string;

    @ApiProperty()

    @IsOptional()
    userId: string;

    @ApiProperty()
    @IsOptional()
    relatedSection: string;
}

export class TicketRegistrationResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    result;
    @ApiProperty()
    message: string;
}
