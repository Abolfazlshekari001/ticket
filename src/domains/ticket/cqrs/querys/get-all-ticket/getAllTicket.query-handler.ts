import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InternalServerError } from 'src/common/translates/Error.Translate';
import { getAllTicketQuery } from './getAllTicket.query';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { TicketService } from 'src/domains/ticket/ticket.service';

@QueryHandler(getAllTicketQuery)
export class getAllTicketQueryHandler implements IQueryHandler<getAllTicketQuery> {
    constructor(private readonly ticketService: TicketService) {}
    async execute(query: getAllTicketQuery): Promise<any> {
        const { audience, section } = query.req.user;
        try {
            if (section === sectionTypeEnum.SYSTEM) {
                const ticket = await this.ticketService.findAllSystemTicket(audience);
                return ticket;
            } else if (section === sectionTypeEnum.SUBSYSTEM) {
                const ticket = await this.ticketService.findAllSubSystemTicket(audience);
                return ticket;
            }
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
