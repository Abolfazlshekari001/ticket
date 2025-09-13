import { Body, Controller, Get, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TicketRegistrationResponseDto, TicketRegistrationSubmitDto } from './dto/ticketRegistration.dto';
import { TicketRegistrationCommand } from './cqrs/commands/ticket-registration/ticket-registration.commad';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { sendMessageOperatorResponseDto, sendMessageOperatorSubmitDto } from './dto/sendMessage-operator.dto';
import { SendMessageOperatorCommand } from './cqrs/commands/sendMessage-operator/sendMessage-operator.command';
import { sendMessageUserSubmitDto, sendMessageUserResponseDto } from './dto/sendMessage-user.dto';
import { SendMessageUserCommand } from './cqrs/commands/sendMessage-user/sendMessage-user.command';
import { FormatResponseInterceptor } from 'src/common/interceptor/format-response.interceptor';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequiredQuery } from 'src/common/decorator/RequiredQuery.decorator';
import { GetAllMessageForTicketQuery } from './cqrs/querys/get-all-message-ticket/get-all-message-ticket.quet';
import { GetAllTicketForUserQuery } from './cqrs/querys/get-all-ticket-user/get-all-ticket-user.query';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/get-role.decorator';
import { Role } from '../system/entity/enum/agent-role.enum';
import { GetAllTicketsWithoutOperatorQuery } from './cqrs/querys/getAllTicketsWithoutOperator/getAllTicketsWithoutOperator.query';
import { getAllTicketQuery } from './cqrs/querys/get-all-ticket/getAllTicket.query';
import { getOperatorTicketsQuery } from './cqrs/querys/get-operator-tickets/getOperatorTickets.query';
import { sectionTypeEnum } from '../system/entity/enum/sectionType.emun';
import { ChengeStatusTicketCommand } from './cqrs/commands/chengeStatusTicket/chengeStatusTicket.command';
import { GetSubmittedSubSystemTicketsQuery } from './cqrs/querys/get-submitted-subSystem-tickets/get-submitted-subSystem-tickets.query';
import { GetTicketsForUserQuery } from './cqrs/querys/get-tickets-user/get-tickets-user.query';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
@UseInterceptors(FormatResponseInterceptor)
@Controller('api/v1/ticket')
export class TicketController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}
    // ------------------------- ticket  ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Post('ticketRegistration')
    @ApiOperation({
        summary: 'registration a ticket',
        description: 'registration a ticket',
    })
    @ApiBody({ type: TicketRegistrationSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully registered.',
        type: TicketRegistrationResponseDto,
    })
    @UseInterceptors(AnyFilesInterceptor())
    @ApiResponse({ status: 404, description: 'not found' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async ticketRegistration(
        @Req() req,
        @UploadedFiles() file: Express.Multer.File[],
        @Body() body: TicketRegistrationSubmitDto,
    ): Promise<TicketRegistrationResponseDto> {
        const result = await this.commandBus.execute(new TicketRegistrationCommand(req, body, file));
        return result as TicketRegistrationResponseDto;
    }

    // ------------------------- send message operator ----------------------------------
    // @Roles(Role.ADMIN)
    // @Roles(Role.OPERATOR)
    // @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('sendMessageOperator')
    @ApiOperation({
        summary: 'send Message Operator',
        description: 'send Message Operator',
    })
    @ApiBody({ type: sendMessageOperatorSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully sended.',
        type: sendMessageOperatorResponseDto,
    })
    @ApiResponse({ status: 409, description: 'not found' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async sendMessageOperator(@Req() req, @UploadedFiles() file, @Body() body: sendMessageOperatorSubmitDto): Promise<sendMessageOperatorResponseDto> {
        const result = await this.commandBus.execute(new SendMessageOperatorCommand(req, body, file));
        return result as sendMessageOperatorResponseDto;
    }
    // ------------------------- send message user ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Post('sendMessageUser')
    @ApiOperation({
        summary: 'send Message user',
        description: 'send Message user',
    })
    @ApiBody({ type: sendMessageUserSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully sended.',
        type: sendMessageUserResponseDto,
    })
    @ApiResponse({ status: 409, description: 'not found' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async sendMessageUser(@Req() req, @UploadedFiles() file, @Body() body: sendMessageUserSubmitDto): Promise<sendMessageUserResponseDto> {
        const result = await this.commandBus.execute(new SendMessageUserCommand(req, body, file));
        return result as sendMessageUserResponseDto;
    }
    // ------------------------- get all  message ticket ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('getAllMessageTicket')
    @ApiOperation({
        summary: 'get all Messages',
        description: 'get all Messages for a ticket',
    })
    @ApiQuery({ name: 'ticketId', type: String })
    async getMessageTicket(@Req() req, @RequiredQuery('ticketId') ticketId, @RequiredQuery('id') id): Promise<any> {
        const result = await this.queryBus.execute(new GetAllMessageForTicketQuery(req, ticketId, id));
        return result;
    }
    // ------------------------- get all ticket user ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('getAllTicketUser')
    @ApiOperation({
        summary: 'get all ticket',
        description: 'get all ticket for a user',
    })
    @ApiQuery({ name: 'userId', type: String })
    async getAllTicketUser(@Req() req, @RequiredQuery('userId') userId): Promise<any> {
        const result = await this.queryBus.execute(new GetAllTicketForUserQuery(req, userId));
        return result;
    }
    // ------------------------- get all ticket without operator ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('getAllTicketsWithoutOperator')
    @ApiOperation({
        summary: 'get All Ticket sWithout Operator',
        description: 'get All Ticket sWithout Operator',
    })
    async getAllTicketWithoutOperator(@Req() req): Promise<any> {
        const result = await this.queryBus.execute(new GetAllTicketsWithoutOperatorQuery(req));
        return result;
    }
    // ------------------------- get all ticket ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('getAllTicket')
    @ApiOperation({
        summary: 'get system/subsystem tickets',
        description: 'get system/subsystem tickets',
    })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully registered.',
        type: TicketRegistrationResponseDto,
    })
    @ApiResponse({ status: 404, description: 'not found' })
    @ApiResponse({ status: 401, description: 'unauthorized' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async getAllTicket(@Req() req, @RequiredQuery('agentId') agentId: string): Promise<any> {
        const result = await this.queryBus.execute(new getAllTicketQuery(req, agentId));
        return result;
    }

    // ------------------------- get operator tickets ----------------------------------
    @Roles(Role.OPERATOR)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('getOperatorTickets')
    @ApiOperation({
        summary: 'get operator tickets',
        description: 'get operator tickets',
    })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully registered.',
        type: TicketRegistrationResponseDto,
    })
    @ApiResponse({ status: 404, description: 'not found' })
    @ApiResponse({ status: 401, description: 'unauthorized' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async getOperatorTickets(@Req() req, @RequiredQuery('agentId') agentId: string): Promise<any> {
        const result = await this.queryBus.execute(new getOperatorTicketsQuery(req, agentId));
        return result;
    }
    // ------------------------- Chenge Status Ticket  ----------------------------------
    @UseGuards(JwtAuthGuard)
    @Put('ChengeStatusTicket')
    @ApiOperation({
        summary: 'registration a ticket',
        description: 'registration a ticket',
    })
    @ApiBody({ type: TicketRegistrationSubmitDto })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully registered.',
        type: TicketRegistrationResponseDto,
    })
    @ApiResponse({ status: 404, description: 'not found' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async ChengeStatusTicket(@Req() req, @RequiredQuery('ticketId') ticketId): Promise<any> {
        const result = await this.commandBus.execute(new ChengeStatusTicketCommand(req, ticketId));
        return result;
    }
    // ------------------------- get Submitted SubSystem Tickets  ----------------------------------
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('getSubmittedSubSystemTickets')
    @ApiOperation({
        summary: 'get all tickets for subSystem',
    })
    @ApiResponse({
        status: 201,
        description: 'The ticket was successfully registered.',
        type: TicketRegistrationResponseDto,
    })
    @ApiResponse({ status: 404, description: 'not found' })
    @ApiResponse({ status: 401, description: 'unauthorized' })
    @ApiResponse({ status: 500, description: 'internal server error' })
    async GetSubmittedSubSystemTickets(@Req() req): Promise<any> {
        const result = await this.queryBus.execute(new GetSubmittedSubSystemTicketsQuery(req));
        return result;
    }
    // ------------------------- get Tickets users----------------------------------
    @UseGuards(JwtAuthGuard)
    @Get('getTicketsUser')
    @ApiOperation({
        summary: 'get  ticket',
        description: 'get ticket for a user',
    })
    @ApiQuery({ name: 'userId', type: String })
    async getTicketsUser(@Req() req, @RequiredQuery('userId') userId): Promise<any> {
        const result = await this.queryBus.execute(new GetTicketsForUserQuery(req, userId));
        return result;
    }
}
