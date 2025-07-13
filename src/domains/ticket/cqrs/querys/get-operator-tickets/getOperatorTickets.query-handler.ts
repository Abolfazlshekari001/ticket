import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InternalServerError } from 'src/common/translates/Error.Translate';
import { getOperatorTicketsQuery } from './getOperatorTickets.query';
import { TicketService } from 'src/domains/ticket/ticket.service';

@QueryHandler(getOperatorTicketsQuery)
export class getOperatorTicketsQueryHandler implements IQueryHandler<getOperatorTicketsQuery> {
    constructor(private readonly ticketService: TicketService) {}
    async execute(query: getOperatorTicketsQuery): Promise<any> {
        const { audience } = query.req.user
        const { agentId } = query;
        try {
            const ticket = await this.ticketService.findOperatorTickets(agentId, audience);
            return ticket;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
