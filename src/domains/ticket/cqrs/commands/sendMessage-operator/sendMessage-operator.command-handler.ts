import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageOperatorCommand } from './sendMessage-operator.command';
import { Connection, Repository } from 'typeorm';
import * as FormData from 'form-data';
import { SystemService } from 'src/domains/system/system.service';
import { HttpException } from '@nestjs/common';
import { Invalid_Input, NotFound } from 'src/common/translates/Error.Translate';
import axios from 'axios';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { statusType } from 'src/domains/ticket/entity/enum/statusType.enum';
import { MessageEntity } from 'src/domains/ticket/entity/message.entity';
import { SenderType } from 'src/domains/ticket/entity/enum/SenderType.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';

@CommandHandler(SendMessageOperatorCommand)
export class SendMessageOperatorCommandHanler implements ICommandHandler<SendMessageOperatorCommand> {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepositoryRepository: Repository<MessageEntity>,
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
        private readonly connection: Connection,
    ) {}
    async execute(command: SendMessageOperatorCommand): Promise<any> {
        const { body, operatorId, ticketId } = command.body;
        const { audience, section } = command.req.user;
        const { FILE_SERVER_USERNAME, SREVICE_TYPE, FILE_SERVER_URL } = process.env;
        const { file } = command;
        let fileUrl = null;
        let agent;
        const newMessage = new MessageEntity();
        const ticket = await this.ticketService.findTicket(ticketId, audience, section);
        if (!ticket) {
            const err = NotFound('این تیکت وجود ندارد', 'This ticket does not exist');
            throw new HttpException(err, err.status_code);
        }
        agent = await this.systemService.getOperator(operatorId, audience);
        if (!agent) {
            const err = NotFound('این اپراتور وجود ندارد', 'This operator does not exist');
            throw new HttpException(err, err.status_code);
        }
        if (agent.role === Role.ADMIN) {
            ticket.operator = agent;
            newMessage.senderType = SenderType.ADMIN;
        } else if (agent.role === Role.OPERATOR) {
            if (ticket.operator !== undefined || ticket.operator !== null) {
                ticket.operator = agent;
                newMessage.senderType = SenderType.OPERATOR;
            } else {
                if (ticket.operator !== agent.id) {
                    const err = Invalid_Input('شناسه اپراتور نادرست است', 'Operator ID is incorrect');
                    throw new HttpException(err, err.status_code);
                }
                newMessage.senderType = SenderType.OPERATOR;
            }
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            ticket.userSeen = false;
            ticket.operatorSeen = true;
            ticket.status = statusType.ANSWERED;
            const resTicket = await queryRunner.manager.save(ticket);
            newMessage.body = body;
            newMessage.senderId = ticket.operator ? ticket.operator.id : agent.id;

            if (file) {
                const formData = new FormData();
                formData.append('files', file.buffer, file.originalname);
                formData.append('systemName', FILE_SERVER_USERNAME);
                formData.append('sreviceType', SREVICE_TYPE);

                const response = await axios.post(FILE_SERVER_URL, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                });
                let index_image_url = [];
                if (response.data.success) {
                    for (const imageUrl of response.data.result) {
                        index_image_url.push(imageUrl.fromRemotePath);
                    }
                }
                fileUrl = index_image_url;
            }
            if (fileUrl !== null) {
                newMessage.attachment = fileUrl;
            }
            newMessage.ticket = resTicket;
            await queryRunner.manager.save(newMessage);
            await queryRunner.commitTransaction();
            return newMessage;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
