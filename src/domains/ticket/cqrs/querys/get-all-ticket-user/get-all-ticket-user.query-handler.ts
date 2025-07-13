import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFound, InternalServerError } from 'src/common/translates/Error.Translate';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { SystemService } from 'src/domains/system/system.service';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { GetAllTicketForUserQuery } from './get-all-ticket-user.query';

@QueryHandler(GetAllTicketForUserQuery)
export class GetAllTicketForUserQueryHandler implements IQueryHandler<GetAllTicketForUserQuery> {
    constructor(
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
    ) {}
    async execute(query: GetAllTicketForUserQuery): Promise<any> {
        const { audience, section } = query.req.user;
        const { userId } = query;
        try {
            let id;

            if (section === sectionTypeEnum.SYSTEM) {
                const system = await this.systemService.findSystemWithSubSystems(audience);
                if (!system) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
                id = system.id;
            } else if (section === sectionTypeEnum.SUBSYSTEM) {
                const subSystem = await this.systemService.findSystemWithSubSystems(audience);
                if (!subSystem) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
                id = subSystem.id;
            }
            const userTicket = await this.ticketService.findAllTicketsForSystemAndSubSystems(userId, id);
            if (!userTicket) {
                const err = NotFound('هیج تیکتی ندارید', 'You have no ticket');
                throw new HttpException(err, err.status_code);
            }
            return userTicket;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
