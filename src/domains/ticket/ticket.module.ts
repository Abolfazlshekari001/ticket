import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketEntity } from 'src/domains/ticket/entity/ticket.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { SendMessageOperatorCommandHanler } from './cqrs/commands/sendMessage-operator/sendMessage-operator.command-handler';
import { TicketRegistrationCommandHandler } from './cqrs/commands/ticket-registration/ticket-registration.commad-handler';
import { SystemModule } from '../system/system.module';
import { SendMessageUserCommandHanler } from './cqrs/commands/sendMessage-user/sendMessage-user.command-handler';
import { JwtStrategy } from 'src/common/jwt_strategy/jwt.sterategy';
import { GetAllMessageForTicketQueryHandler } from './cqrs/querys/get-all-message-ticket/get-all-message-ticket.query-handler';
import { GetAllTicketForUserQueryHandler } from './cqrs/querys/get-all-ticket-user/get-all-ticket-user.query-handler';
import { GetAllTicketsWithoutOperatorQueryHandler } from './cqrs/querys/getAllTicketsWithoutOperator/getAllTicketsWithoutOperator.query-handler';
import { getAllTicketQueryHandler } from './cqrs/querys/get-all-ticket/getAllTicket.query-handler';
import { getOperatorTicketsQueryHandler } from './cqrs/querys/get-operator-tickets/getOperatorTickets.query-handler';
import { SystemEntity } from '../system/entity/system.entity';
import { DepartmentEntity } from '../system/entity/department.entity';
import { ChengeStatusTicketCommandHanler } from './cqrs/commands/chengeStatusTicket/chengeStatusTicket.command-handler';
import { GetSubmittedSubSystemTicketsQueryHandler } from './cqrs/querys/get-submitted-subSystem-tickets/get-submitted-subSystem-tickets.query-handler';
import { GetTicketsForUserQueryHandler } from './cqrs/querys/get-tickets-user/get-tickets-user-query-handler';

export const QueriesHandlers = [
  GetAllMessageForTicketQueryHandler,
  GetAllTicketForUserQueryHandler,
  GetAllTicketsWithoutOperatorQueryHandler,
  getAllTicketQueryHandler,
  getOperatorTicketsQueryHandler,
  GetSubmittedSubSystemTicketsQueryHandler,
  GetTicketsForUserQueryHandler

];
export const CommandHandlers = [
  SendMessageOperatorCommandHanler,
  TicketRegistrationCommandHandler,
  SendMessageUserCommandHanler,
  ChengeStatusTicketCommandHanler
];
@Module({
  imports: [CqrsModule, SystemModule, TypeOrmModule.forFeature([SystemEntity, TicketEntity, MessageEntity, DepartmentEntity])],
  controllers: [TicketController],
  providers: [TicketService, JwtStrategy, ...CommandHandlers, ...QueriesHandlers],
  exports: [TicketService, ...CommandHandlers, ...QueriesHandlers],
})
export class TicketModule { }














