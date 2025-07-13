import { HttpException } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { NotFound, InternalServerError } from "src/common/translates/Error.Translate";
import { sectionTypeEnum } from "src/domains/system/entity/enum/sectionType.emun";
import { SystemService } from "src/domains/system/system.service";
import { TicketService } from "src/domains/ticket/ticket.service";
import { GetTicketsForUserQuery } from "./get-tickets-user.query";

@QueryHandler(GetTicketsForUserQuery)
export class GetTicketsForUserQueryHandler implements IQueryHandler<GetTicketsForUserQuery> {
    constructor(
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
    ) { }
    async execute(query: GetTicketsForUserQuery): Promise<any> {
        const { audience, section } = query.req.user;
        const { userId } = query;
        try {
            let subSystem
            if (section === sectionTypeEnum.SUBSYSTEM) {
                subSystem = await this.systemService.findSubsystem(audience);
                if (!subSystem) {
                    const err = NotFound('این زیرسامانه وجود ندارد', 'This subsystem does not exist');
                    throw new HttpException(err, err.status_code);
                }
                const systemId = subSystem.system.id
                
                const userTicket = await this.ticketService.findTicketsUser(systemId, subSystem.id, userId);
                if (!userTicket) {
                    const err = NotFound('هیج تیکتی ندارید', 'You have no ticket');
                    throw new HttpException(err, err.status_code);
                }
                return userTicket;
            }
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}