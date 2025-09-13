import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerError, NotFound } from 'src/common/translates/Error.Translate';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { SystemService } from 'src/domains/system/system.service';
import { MessageEntity } from 'src/domains/ticket/entity/message.entity';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { Repository, Connection } from 'typeorm';
import { ChengeStatusTicketCommand } from './chengeStatusTicket.command';
import { statusType } from 'src/domains/ticket/entity/enum/statusType.enum';

@CommandHandler(ChengeStatusTicketCommand)
export class ChengeStatusTicketCommandHanler implements ICommandHandler<ChengeStatusTicketCommand> {
    constructor(
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
    ) {}
    async execute(command: ChengeStatusTicketCommand): Promise<any> {
        const { ticketId } = command;
        const { audience, section } = command.req.user;
        try {
            if (section === sectionTypeEnum.SYSTEM) {
                const system = await this.systemService.findSystemById(audience);
                if (!system) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
            } else {
                const subSystem = await this.systemService.findSubsystem(audience);
                if (!subSystem) {
                    const err = NotFound('این زیرسامانه وجود ندارد', 'This subsystem does not exist');
                    throw new HttpException(err, err.status_code);
                }
            }
            const ticket = await this.ticketService.findTicketClose(ticketId);
            if (!ticket) {
                const err = NotFound('این تیکت وجود ندارد', 'This ticket does not exist');
                throw new HttpException(err, err.status_code);
            }
            ticket.status = statusType.CLOSE;
            await ticket.save();
            return ticket;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
