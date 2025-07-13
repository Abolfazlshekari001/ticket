import { sectionTypeEnum } from './../system/entity/enum/sectionType.emun';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { TicketEntity } from './entity/ticket.entity';
import { SystemEntity } from '../system/entity/system.entity';
import { SubSystemEntity } from '../system/entity/subsystem.entity';
import { DepartmentEntity } from '../system/entity/department.entity';

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(TicketEntity)
        private readonly ticketRepository: Repository<TicketEntity>,
        @InjectRepository(SystemEntity)
        private readonly systemRepository: Repository<SystemEntity>,
    ) {}

    async findTicket(ticketId: string, sectionId: string, sectionTypeEnum: sectionTypeEnum) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId, deletedAt: IsNull(), sectionId: sectionId, sectionType: sectionTypeEnum },

            relations: ['operator'],
        });
        return ticket;
    }

    async findTicketMessage(ticketId: string) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId, deletedAt: IsNull() },

            relations: ['operator'],
        });
        return ticket;
    }

    async findTicketClose(ticketId: string) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId, deletedAt: IsNull() },

            relations: ['operator'],
        });
        return ticket;
    }
    async findAllMessageTicket(ticketId: string, sectionId: string, sectionTypeEnum: sectionTypeEnum) {
        const ticket = await this.ticketRepository
            .createQueryBuilder('ticket')
            .select(['ticket.id', 'ticket.title', 'ticket.operatorSeen', 'ticket.userSeen'])
            .leftJoinAndSelect('ticket.message', 'message')
            .leftJoinAndSelect('ticket.operator', 'operator')
            .where('ticket.id = :ticketId', { ticketId })
            .andWhere('ticket.sectionId = :sectionId', { sectionId })
            .andWhere('ticket.sectionType = :sectionType', { sectionTypeEnum })
            .andWhere('message.deletedAt IS NULL')
            .getOne();

        return ticket;
    }

    async findAllMessageTicketById(ticketId: string) {
        const ticket = await this.ticketRepository
            .createQueryBuilder('ticket')
            .select([
                'ticket.id',
                'ticket.title',
                'ticket.operatorSeen',
                'ticket.userSeen',
                'ticket.userId',
                'ticket.priorirty',
                'ticket.status',
                'ticket.createdAt',
                'ticket.name',
                'department.id',
                'department.tite',
            ])
            .leftJoinAndSelect('ticket.message', 'message')
            .leftJoinAndSelect('ticket.operator', 'operator')
            .leftJoinAndSelect('ticket.department', 'department')
            .orderBy('message.createdAt', 'ASC')
            .where('ticket.id = :ticketId', { ticketId })
            .andWhere('message.deletedAt IS NULL')
            .getOne();

        return ticket;
    }

    async findAllTicketUser(userId: string) {
        const user = await this.ticketRepository.find({
            where: { userId: userId, deletedAt: IsNull() },
        });
        return user;
    }
    async findAllTicketsForSystemAndSubSystems(userId: string, systemId: string) {
        const res = this.ticketRepository.find({
            where: {
                userId: userId,
                sectionId: systemId,
                deletedAt: IsNull(),
            },
            order: {
                updatedAt: 'DESC',
            },
            relations: ['department'],
        });

        (await res).forEach((ticket) => {
            delete ticket.sectionId;
        });
        return res;
    }

    async findUser(ticketId: string, userId) {
        const user = await this.ticketRepository.findOne({
            where: { id: ticketId, userId: userId, deletedAt: IsNull() },
        });
        return user.userId;
    }

    async checkOperator(ticketId: string, operatorId: string) {
        const ticket = await this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.operator', 'operator')
            .where('ticket.id = :ticketId', { ticketId })
            .andWhere('operator.id = :operatorId', { operatorId })
            .andWhere('ticket.sectionType IN (:...sections)', { sections: [sectionTypeEnum.SYSTEM, sectionTypeEnum.SUBSYSTEM] })
            .getOne();

        return ticket;
    }

    async getAllTicketsWithoutOperator(sectionId: string, sectionType: sectionTypeEnum) {
        const ticket = await this.ticketRepository.find({
            where: {
                sectionId: sectionId,
                sectionType: sectionType,
                operator: IsNull(),
                deletedAt: IsNull(),
            },
            order: {
                updatedAt: 'DESC',
            },
            relations: ['department'],
        });
        return ticket;
    }

    async findAllSystemTicket(systemId: string) {
        const result = await this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndMapOne('ticket.system', SystemEntity, 'system', 'CAST(system.id AS VARCHAR) = ticket.sectionId AND ticket.sectionType = :systemType', {
                systemType: 'system',
            })
            .where('system.id = :systemId', { systemId })
            .orderBy('ticket.updatedAt', 'DESC')
            .select('ticket')
            .getMany();
        return result;
    }

    async findAllSubSystemTicket(subSystemId: string) {
        const result = await this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndMapOne(
                'ticket.subsystem',
                SubSystemEntity,
                'subsystem',
                'CAST(subsystem.id AS VARCHAR) = ticket.sectionId AND ticket.sectionType = :systemType',
                {
                    systemType: 'subsystem',
                },
            )
            .leftJoinAndMapOne('ticket.department', DepartmentEntity, 'department', 'department.id = ticket.departmentId')
            .where('subsystem.id = :subSystemId', { subSystemId })
            .orderBy('ticket.updatedAt', 'DESC')
            .select(['ticket', 'department.id', 'department.tite'])
            .getMany();
        return result;
    }

    async findOperatorTickets(operatorId: string, sectionId: string) {
        const result = await this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoin('ticket.operator', 'operator')
            .where('operator.agentId = :operatorId', { operatorId })
            .andWhere('ticket.sectionId = :sectionId', { sectionId })
            .orderBy('ticket.updatedAt', 'DESC')
            .getMany();
        return result;
    }

    async findAllTicketsForSystem(userId: string, systemId: string): Promise<TicketEntity[]> {
        const res = this.ticketRepository.find({
            where: {
                userId: userId,
                sectionId: systemId,
                deletedAt: IsNull(),
            },
            order: {
                updatedAt: 'DESC',
            },
            relations: ['department'],
        });
        return res;
    }

    async findTicketsUser(systemId, subSystemId, userId) {
        const tickets = await this.ticketRepository.find({
            where: [
                systemId ? { sectionId: systemId, deletedAt: IsNull(), userId: userId } : null,
                subSystemId ? { sectionId: subSystemId, deletedAt: IsNull(), userId: userId } : null,
            ].filter(Boolean),
            order: {
                updatedAt: 'DESC',
            },
            relations: ['department'],
        });
        return tickets;
    }
}
