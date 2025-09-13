import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as FormData from 'form-data';
import { forbiddenResource, NotFound } from 'src/common/translates/Error.Translate';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { SystemService } from 'src/domains/system/system.service';
import { SenderType } from 'src/domains/ticket/entity/enum/SenderType.enum';
import { statusType } from 'src/domains/ticket/entity/enum/statusType.enum';
import { MessageEntity } from 'src/domains/ticket/entity/message.entity';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { Repository, Connection } from 'typeorm';
import { SendMessageUserCommand } from './sendMessage-user.command';

@CommandHandler(SendMessageUserCommand)
export class SendMessageUserCommandHanler implements ICommandHandler<SendMessageUserCommand> {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepositoryRepository: Repository<MessageEntity>,
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
        private readonly connection: Connection,
    ) {}
    async execute(command: SendMessageUserCommand): Promise<any> {
        const { body, userId, ticketId } = command.body;
        const { audience, section } = command.req.user;
        const { FILE_SERVER_USERNAME, SREVICE_TYPE, FILE_SERVER_URL } = process.env;
        const { file } = command;
        let fileUrl = null;
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
        const ticket = await this.ticketService.findTicketMessage(ticketId);
        if (!ticket) {
            const err = NotFound('این تیکت وجود ندارد', 'This ticket does not exist');
            throw new HttpException(err, err.status_code);
        }
        const user = await this.ticketService.findUser(ticket.id, userId);
        if (!user) {
            throw new HttpException(forbiddenResource, forbiddenResource.status_code);
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            ticket.status = statusType.AWAITINGREPLY;
            ticket.userSeen = true;
            ticket.operatorSeen = false;
            const resTicket = await queryRunner.manager.save(ticket);
            const newMessage = new MessageEntity();
            newMessage.body = body;
            newMessage.senderId = user;
            newMessage.senderType = SenderType.USER;
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
                const index_image_url = [];
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
