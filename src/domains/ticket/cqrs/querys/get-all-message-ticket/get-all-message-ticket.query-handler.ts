import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TicketService } from 'src/domains/ticket/ticket.service';
import { SystemService } from 'src/domains/system/system.service';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';
import { TicketEntity } from 'src/domains/ticket/entity/ticket.entity';
import { GetAllMessageForTicketQuery } from './get-all-message-ticket.quet';
import { NotFound, InternalServerError, forbiddenResource } from 'src/common/translates/Error.Translate';
import axios from 'axios';

@QueryHandler(GetAllMessageForTicketQuery)
export class GetAllMessageForTicketQueryHandler implements IQueryHandler<GetAllMessageForTicketQuery> {
    constructor(
        @InjectRepository(TicketEntity)
        private readonly ticketRepositoryRepository: Repository<TicketEntity>,
        private readonly systemService: SystemService,
        private readonly ticketService: TicketService,
    ) {}
    async execute(query: GetAllMessageForTicketQuery): Promise<any> {
        const { audience } = query.req.user;
        const { ticketId, id } = query;
        try {
            const { FILE_SERVER_USERNAME, SREVICE_TYPE, FILE_SERVER_URL } = process.env;
            const ticketMessage = await this.ticketService.findAllMessageTicketById(ticketId);
            if (!ticketMessage) {
                const err = NotFound('این تیکت وجود ندارد', 'This ticket does not exist');
                throw new HttpException(err, err.status_code);
            }
            const admin = await this.systemService.findAdminById(id, audience);
            if (!admin) {
                if (ticketMessage.userId === id) {
                    ticketMessage.userSeen = true;
                } else if (ticketMessage.operator.agentId === id) {
                    const agent = await this.systemService.getOperator(id, audience);
                    if (!agent) {
                        const err = NotFound('این اپراتور وجود ندارد', 'This operator does not exist');
                        throw new HttpException(err, err.status_code);
                    }
                    if (agent.role !== Role.ADMIN || ticketMessage.operator.id !== id) {
                        new HttpException(forbiddenResource, forbiddenResource.status_code);
                    }
                    ticketMessage.operatorSeen = true;
                } else {
                    const err = NotFound('این شناسه وجود ندارد', 'This id does not exist');
                    throw new HttpException(err, err.status_code);
                }
                await this.ticketRepositoryRepository.save(ticketMessage);
            }
            if (ticketMessage.message?.length > 0) {
                for (const message of ticketMessage.message) {
                    if (message.attachment) {
                        const body = {
                            fromRemotePath: message.attachment,
                            systemName: FILE_SERVER_USERNAME,
                            sreviceType: SREVICE_TYPE,
                        };
                        const response = await axios.post(`${FILE_SERVER_URL}/fileSystem/downloadBase64`, body);
                        message['base64'] = response.data.result.base64;
                    }
                }
            }
            const result = {
                ticket: {
                    id: ticketMessage.id,
                    title: ticketMessage.title,
                    priority: ticketMessage.priorirty,
                    status: ticketMessage.status,
                    createdAt: ticketMessage.createdAt,
                    userSeen: ticketMessage.userSeen,
                    operatorSeen: ticketMessage.operatorSeen,
                    name: ticketMessage.name,
                    departemantId: ticketMessage.department.id,
                    departemantName: ticketMessage.department.tite,
                },
                operator: ticketMessage.operator,
                messages: ticketMessage.message,
            };
            return result;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
