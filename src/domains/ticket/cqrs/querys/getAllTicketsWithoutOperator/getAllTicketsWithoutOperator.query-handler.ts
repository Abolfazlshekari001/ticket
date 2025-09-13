import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFound, InternalServerError } from 'src/common/translates/Error.Translate';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { SystemService } from 'src/domains/system/system.service';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { GetAllTicketsWithoutOperatorQuery } from './getAllTicketsWithoutOperator.query';

@QueryHandler(GetAllTicketsWithoutOperatorQuery)
export class GetAllTicketsWithoutOperatorQueryHandler implements IQueryHandler<GetAllTicketsWithoutOperatorQuery> {
    constructor(
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
    ) {}
    async execute(query: GetAllTicketsWithoutOperatorQuery): Promise<any> {
        const { audience, section } = query.req.user;
        try {
            if (section === sectionTypeEnum.SYSTEM) {
                const sectiontsystem = await this.systemService.findSystemById(audience);
                if (!sectiontsystem) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
            } else {
                const sectiontSubSystem = await this.systemService.findSubsystem(audience);
                if (!sectiontSubSystem) {
                    const err = NotFound('این زیرسامانه وجود ندارد', 'This subsystem does not exist');
                    throw new HttpException(err, err.status_code);
                }
            }
            const ticket = await this.ticketService.getAllTicketsWithoutOperator(audience, section);
            return ticket;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
