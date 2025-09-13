import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InternalServerError } from 'src/common/translates/Error.Translate';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { GetSubmittedSubSystemTicketsQuery } from './get-submitted-subSystem-tickets.query';
import { SystemService } from 'src/domains/system/system.service';

@QueryHandler(GetSubmittedSubSystemTicketsQuery)
export class GetSubmittedSubSystemTicketsQueryHandler implements IQueryHandler<GetSubmittedSubSystemTicketsQuery> {
    constructor(
        private readonly ticketService: TicketService,
        private readonly systemService: SystemService,
    ) {}
    async execute(query: GetSubmittedSubSystemTicketsQuery): Promise<any> {
        const { audience } = query.req.user;
        try {
            const allTickets = [];
            const findSubSystem = await this.systemService.findSubsystemAndAgent(audience);
            const system = findSubSystem?.subSystem?.system.id;
            const agents = findSubSystem?.agents.map((id) => id.agentId);

            for (const agent of agents) {
                const getTicket = await this.ticketService.findAllTicketsForSystem(agent, system);
                allTickets.push(...getTicket);
            }
            return allTickets;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
