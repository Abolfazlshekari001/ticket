import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Connection } from 'typeorm';
import * as FormData from 'form-data';
import axios from 'axios';
import { InternalServerError, NotFound } from 'src/common/translates/Error.Translate';
import { SystemService } from 'src/domains/system/system.service';
import { TicketRegistrationCommand } from './ticket-registration.commad';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { TicketEntity } from 'src/domains/ticket/entity/ticket.entity';
import { statusType } from 'src/domains/ticket/entity/enum/statusType.enum';
import { MessageEntity } from 'src/domains/ticket/entity/message.entity';
import { SenderType } from 'src/domains/ticket/entity/enum/SenderType.enum';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';

@CommandHandler(TicketRegistrationCommand)
export class TicketRegistrationCommandHandler implements ICommandHandler<TicketRegistrationCommand> {
    constructor(
        private readonly systemService: SystemService,
        private readonly connection: Connection,
    ) {}
    async execute(command: TicketRegistrationCommand): Promise<any> {
        const { departmentId, priorirty, title, body, userId, relatedSection, name } = command.body;
        const { file } = command;
        const { audience, section } = command.req.user;
        const { FILE_SERVER_USERNAME, SREVICE_TYPE, FILE_SERVER_URL } = process.env;
        let relatedId: string;
        let system: SystemEntity;
        let subSystem: SubSystemEntity;
        try {
            if (section === sectionTypeEnum.SYSTEM) {
                system = await this.systemService.findSystemById(audience);
                if (!system) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
                const department = await this.systemService.findDepartmentByIdAndRelatedId(departmentId, system.id);
                if (!department) {
                    const err = NotFound('این دپارتمان وجود ندارد', 'This department does not exist');
                    throw new HttpException(err, err.status_code);
                }

                const queryRunner = this.connection.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    const newTicket = new TicketEntity();
                    newTicket.userSeen = true;
                    newTicket.operatorSeen = false;
                    newTicket.status = statusType.AWAITINGREPLY;
                    newTicket.userId = userId;
                    newTicket.name = name;
                    newTicket.priorirty = priorirty;
                    newTicket.title = title;
                    newTicket.department = department;
                    newTicket.sectionType = relatedSection;
                    newTicket.sectionId = system.id;
                    const resTicket = await queryRunner.manager.save(newTicket);
                    const newMessage = new MessageEntity();
                    newMessage.body = body;
                    newMessage.senderId = userId;
                    newMessage.senderType = SenderType.USER;
                    const resMessage = await queryRunner.manager.save(newMessage);

                    let fileUrl = null;
                    if (file.length !== 0) {
                        const formData = new FormData();
                        const fileToUpload = Array.isArray(file) ? file[0] : file;
                        formData.append('files', fileToUpload.buffer, {
                            filename: fileToUpload.originalname,
                            contentType: 'image/png',
                        });
                        formData.append('systemName', FILE_SERVER_USERNAME);
                        formData.append('sreviceType', SREVICE_TYPE);

                        const response = await axios.post(`${FILE_SERVER_URL}/fileSystem/upload`, formData, {
                            headers: { ...formData.getHeaders() },
                        });
                        if (response.data.success && response.data.result.length > 0) {
                            fileUrl = response.data.result[0].fromRemotePath;
                        }
                    }
                    if (fileUrl !== null) {
                        resMessage.attachment = fileUrl;
                    }
                    resMessage.ticket = resTicket;
                    await queryRunner.manager.save(resMessage);
                    await queryRunner.commitTransaction();
                    return newMessage;
                } catch (error) {
                    await queryRunner.rollbackTransaction();
                    throw error;
                } finally {
                    await queryRunner.release();
                }
            } else if (section === sectionTypeEnum.SUBSYSTEM) {
                subSystem = await this.systemService.findSubsystem(audience);
                if (!subSystem) {
                    const err = NotFound('این زیرسامانه وجود ندارد', 'This subsystem does not exist');
                    throw new HttpException(err, err.status_code);
                }
            }
            if (relatedSection === sectionTypeEnum.SYSTEM) {
                relatedId = subSystem.system.id;
            } else if (relatedSection === sectionTypeEnum.SUBSYSTEM) {
                relatedId = subSystem.id;
            }
            const department = await this.systemService.findDepartmentByIdAndRelatedId(departmentId, relatedId);
            if (!department) {
                const err = NotFound('این دپارتمان وجود ندارد', 'This department does not exist');
                throw new HttpException(err, err.status_code);
            }

            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const newTicket = new TicketEntity();
                newTicket.userSeen = true;
                newTicket.operatorSeen = false;
                newTicket.status = statusType.AWAITINGREPLY;
                newTicket.userId = userId;
                newTicket.name = name;
                newTicket.priorirty = priorirty;
                newTicket.title = title;
                newTicket.department = department;
                newTicket.sectionType = relatedSection;
                newTicket.sectionId = relatedId;
                const resTicket = await queryRunner.manager.save(newTicket);
                const newMessage = new MessageEntity();
                newMessage.body = body;
                newMessage.senderId = userId;
                newMessage.senderType = SenderType.USER;
                const resMessage = await queryRunner.manager.save(newMessage);

                let fileUrl = null;
                if (file.length !== 0) {
                    const formData = new FormData();
                    const fileToUpload = Array.isArray(file) ? file[0] : file;
                    formData.append('files', fileToUpload.buffer, {
                        filename: fileToUpload.originalname,
                        contentType: 'image/png',
                    });
                    formData.append('systemName', FILE_SERVER_USERNAME);
                    formData.append('sreviceType', SREVICE_TYPE);

                    const response = await axios.post(`${FILE_SERVER_URL}/fileSystem/upload`, formData, {
                        headers: { ...formData.getHeaders() },
                    });
                    if (response.data.success && response.data.result.length > 0) {
                        fileUrl = response.data.result[0].fromRemotePath;
                    }
                }
                if (fileUrl !== null) {
                    resMessage.attachment = fileUrl;
                }
                resMessage.ticket = resTicket;
                await queryRunner.manager.save(resMessage);
                await queryRunner.commitTransaction();
                return newMessage;
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
        } catch (error) {
            if (error.response?.data) {
                throw new HttpException(error.response.data.result, error.response.data.result.status_code);
            } else if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
