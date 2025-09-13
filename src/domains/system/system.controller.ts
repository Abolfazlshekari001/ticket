import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddSystemCommand } from './cqrs/command/addSystem/addSystem.command';
import { addSystemSubmitDto, addSystemResponseDto } from './dto/addSystem.dto';
import { FormatResponseInterceptor } from 'src/common/interceptor/format-response.interceptor';
import { addSubSystemResponseDto, addSubSystemSubmitDto } from './dto/addSubSystem.dto';
import { AddSubSystemCommand } from './cqrs/command/addSubSystem/addSubSystem.command';
import { RequiredQuery } from 'src/common/decorator/RequiredQuery.decorator';
import { addoperatorResponseDto, addoperatorSubmitDto } from './dto/addOperator.dto';
import { AddOperatorCommand } from './cqrs/command/addOperator/addOperator.commad';
import { addDepartemanSubmitDto, addDepartemanResponseDto } from './dto/addDepartemant.dto';
import { AddDepartemantCommand } from './cqrs/command/addDepartemant/addDepartemant.command';
import { checkSystemResponseDto, checkSystemSubmitDto } from './dto/checkSystem.dto';
import { GetSystemQuery } from './cqrs/queries/getSystem/getSystem.query';
import { GetSubSystemsToSystemQuery } from './cqrs/queries/getSubSystemInsystem/getSubSystemsInsystem.query';
import { DeleteSystemCommand } from './cqrs/command/deleteSystem/deleteSystem.command';
import { DeleteSubSystemsToSystemCommand } from './cqrs/command/deleteSubsystemForSystem/deleteSubsystemForSystem.command';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/get-role.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from './entity/enum/agent-role.enum';
import { GetAllDepartemantQuery } from './cqrs/queries/getAlldepartemant/getAlldepartemant.query';
import { sectionTypeEnum } from './entity/enum/sectionType.emun';
import { GetAllDepartemantSystemQuery } from './cqrs/queries/getAllDepartmentSystem/getAllDepartmentSystem.query';

@UseInterceptors(FormatResponseInterceptor)
@Controller('api/v1/system')
export class SystemController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    // ------------------------- add system ----------------------------------
    @Post('create')
    @ApiOperation({
        summary: 'create a System',
        description: 'create a System  and add a admin for system',
    })
    @ApiBody({ type: addSystemSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The System was successfully created.',
        type: addSystemResponseDto,
    })
    async createSystem(@Req() req, @Body() body: addSystemSubmitDto): Promise<addSystemResponseDto> {
        const result = await this.commandBus.execute(new AddSystemCommand(req, body));
        return result as addSystemResponseDto;
    }
    // ------------------------- add subSystem ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('create/subSystem')
    @ApiOperation({
        summary: 'create a subSystem',
        description: 'create a subSystem for a Systsem and add a admin for subSystem',
    })
    @ApiBody({ type: addSubSystemSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The subSystem was successfully created.',
        type: addSubSystemResponseDto,
    })
    async createSubSystem(@Req() req, @Body() body: addSubSystemSubmitDto): Promise<addSubSystemResponseDto> {
        const result = await this.commandBus.execute(new AddSubSystemCommand(req, body));
        return result as addSubSystemResponseDto;
    }
    // ------------------------- add operator ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('add/operator')
    @ApiOperation({
        summary: 'add a operator',
        description: 'add  a operator for a Systsem or subSystem',
    })
    @ApiBody({ type: addoperatorSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The operator was successfully added.',
        type: addoperatorResponseDto,
    })
    async addOprator(@Req() req, @Body() body: addoperatorSubmitDto): Promise<addoperatorResponseDto> {
        const result = await this.commandBus.execute(new AddOperatorCommand(req, body));
        return result as addoperatorResponseDto;
    }

    // ------------------------- add Departeman ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('add/departemant')
    @ApiOperation({
        summary: 'add a departemant',
        description: 'add  a departemant for a Systsem or subSystem',
    })
    @ApiBody({ type: addDepartemanSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The departemant was successfully added.',
        type: addDepartemanResponseDto,
    })
    async addDepartemant(@Req() req, @Body() body: addDepartemanSubmitDto): Promise<addDepartemanResponseDto> {
        const result = await this.commandBus.execute(new AddDepartemantCommand(req, body));
        return result as addDepartemanResponseDto;
    }
    // ------------------------- delete system ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    @ApiOperation({
        summary: 'delete a system',
        description: 'delete a system and all agent , subSystem',
    })
    @ApiBody({ type: checkSystemSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The system was successfully deleted.',
        type: checkSystemResponseDto,
    })
    async deleteSystem(@Req() req, @Body() body: checkSystemSubmitDto): Promise<checkSystemResponseDto> {
        const result = await this.commandBus.execute(new DeleteSystemCommand(req, body));
        return result as checkSystemResponseDto;
    }
    // ------------------------- delete subSystem ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Delete('delete/subSystem')
    @ApiOperation({
        summary: 'delete a subsystem',
        description: 'delete s subsystem and all agent',
    })
    async deleteSubSystem(@Req() req, @RequiredQuery('subsystemId') subsystemId): Promise<checkSystemSubmitDto> {
        const result = await this.commandBus.execute(new DeleteSubSystemsToSystemCommand(req, subsystemId));
        return result as checkSystemSubmitDto;
    }
    // ------------------------- get system ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('getOne')
    @ApiOperation({
        summary: 'get a system',
        description: 'get a system and all agent , subSystem',
    })
    async getSystem(@Req() req): Promise<any> {
        const result = await this.queryBus.execute(new GetSystemQuery(req));
        return result;
    }
    // ------------------------- get subSystem ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('getOne/subSystem')
    @ApiOperation({
        summary: 'get a subsystem',
        description: 'get s subsystem and all agent',
    })
    async getsubSystem(@Req() req, @RequiredQuery('referenceId') referenceId): Promise<checkSystemResponseDto> {
        const result = await this.queryBus.execute(new GetSubSystemsToSystemQuery(req, referenceId));
        return result as checkSystemResponseDto;
    }
    // ------------------------- get departemant for system ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('get/allDepartemant')
    @ApiOperation({
        summary: 'get all departemant',
        description: 'get all departemant for a Sytsem',
    })
    async getDepartemant(@Req() req, @Query('sectionType') sectionType: sectionTypeEnum): Promise<any> {
        const result = await this.queryBus.execute(new GetAllDepartemantQuery(req, sectionType));
        return result;
    }
    // ------------------------- get departemant for system ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('get/allDepartemant-system')
    @ApiOperation({
        summary: 'get all departemant',
        description: 'get all departemant for a Sytsem',
    })
    async getSystemDepartemant(@Req() req): Promise<any> {
        const result = await this.queryBus.execute(new GetAllDepartemantSystemQuery(req));
        return result;
    }
}
