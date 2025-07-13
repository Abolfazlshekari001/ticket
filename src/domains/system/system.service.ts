import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, getRepository } from 'typeorm';
import { SystemEntity } from './entity/system.entity';
import { SubSystemEntity } from './entity/subsystem.entity';
import { AgentsEntity } from './entity/agents.entity';
import { Role } from './entity/enum/agent-role.enum';
import { DataNotFound, InternalServerError } from 'src/common/translates/Error.Translate';
import { DepartmentEntity } from './entity/department.entity';

@Injectable()
export class SystemService {
    constructor(
        @InjectRepository(SystemEntity)
        private readonly systemRepository: Repository<SystemEntity>,
        @InjectRepository(SubSystemEntity)
        private readonly subSystemRepository: Repository<SubSystemEntity>,
        @InjectRepository(AgentsEntity)
        private readonly agentRepository: Repository<AgentsEntity>,
        @InjectRepository(DepartmentEntity)
        private readonly departmentRepository: Repository<DepartmentEntity>,
    ) { }

    async findSystem(systemId: string) {
        try {
            const system = await this.systemRepository.findOne({
                where: { id: systemId, deletedAt: IsNull() },
            });
            return system;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

    async findSystemByUsername(userName: string) {
        try {
            const system = await this.systemRepository.findOne({
                where: { userName: userName, deletedAt: IsNull() },
            });
            return system;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
    async findOneSystem(userName: string, password: string) {
        try {
            const system = await this.systemRepository
                .createQueryBuilder('system')
                .where('system.userName = :userName', { userName })
                .andWhere('system.password = :password', { password })
                .getOne();

            if (!system) {
                throw new HttpException(DataNotFound, DataNotFound.status_code);
            }
            const agents = await this.agentRepository
                .createQueryBuilder('agent')
                .where('agent.relatedId = :systemId', { systemId: system.id })
                .andWhere('agent.relatedType = :systemType', { systemType: 'system' })
                .getMany();

            const subsystems = await this.subSystemRepository
                .createQueryBuilder('subSystem')
                .where('subSystem.systemId = :systemId', { systemId: system.id })
                .andWhere('subSystem.deletedAt IS NULL')
                .getMany();

            return {
                system,
                agents,
                subsystems,
            };
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

    async findSystemById(systemId: string) {
        try {
            const system = await this.systemRepository.findOne({
                where: { id: systemId, deletedAt: IsNull() },
            });
            return system;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

    async findReferenceId(ferenceId: string, systemId: string) {
        try {
            const ference = await this.subSystemRepository.findOne({
                where: { referenceId: ferenceId, deletedAt: IsNull(), system: { id: systemId } },
            });
            return ference;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

    async findSubsystem(id: string) {
        try {
            const subSystem = await this.subSystemRepository.findOne({
                where: { id: id, deletedAt: IsNull() },
                relations: ['system'],
            });
            return subSystem;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

    async findAgentById(agentId: string, relatedId: string): Promise<AgentsEntity> {
        const result = this.agentRepository.findOne({ where: { agentId, relatedId } });
        return result;
    }

    async findDepartmentByIdAndRelatedId(departmentId: string, relatedId: string) {
        const result = await this.departmentRepository.findOne({
            where: { id: departmentId, deletedAt: null, relatedId: relatedId },
        });
        return result;
    }

    async findSubSystemForSystemById(subsystemId: string, systemId: string) {
        const subSystem = await this.subSystemRepository
            .createQueryBuilder('subSystem')
            .where('subSystem.systemId = :systemId', { systemId })
            .andWhere('subSystem.id = :subsystemId', { subsystemId })
            .andWhere('subSystem.deletedAt IS NULL')
            .getOne();

        const agents = await this.agentRepository
            .createQueryBuilder('agent')
            .where('agent.relatedId = :subSystemId', { subSystemId: subSystem.id })
            .andWhere('agent.relatedType = :systemType', { systemType: 'subsystem' })
            .getMany();

        return {
            subSystem,
            agents,
        };
    }

    async findSubSystemForSystemByRefrenceId(referenceId: string, systemId: string) {
        const subSystem = await this.subSystemRepository
            .createQueryBuilder('subSystem')
            .where('subSystem.systemId = :systemId', { systemId })
            .andWhere('subSystem.referenceId = :referenceId', { referenceId })
            .andWhere('subSystem.deletedAt IS NULL')
            .getOne();

        const agents = await this.agentRepository
            .createQueryBuilder('agent')
            .where('agent.relatedId = :subSystemId', { subSystemId: subSystem.id })
            .andWhere('agent.relatedType = :systemType', { systemType: 'subsystem' })
            .getMany();

        return {
            subSystem,
            agents,
        };
    }

    async getAllDepartemantForSystem(systemId: string) {
        const departemants = await this.departmentRepository
            .createQueryBuilder('department')
            .where('department.relatedId = :systemId', { systemId })
            .andWhere('department.relatedType = :systemType', { systemType: 'system' })
            .andWhere('department.deletedAt IS NULL')
            .getMany();

        return departemants;
    }

    async getAllDepartemantForSubSystem(referenceId: string, systemId: string) {
        const subSystem = await this.subSystemRepository
            .createQueryBuilder('subSystem')
            .where('subSystem.systemId = :systemId', { systemId })
            .andWhere('subSystem.referenceId = :referenceId', { referenceId })
            .andWhere('subSystem.deletedAt IS NULL')
            .getOne();

        const departemants = await this.departmentRepository
            .createQueryBuilder('department')
            .where('department.relatedId = :subSystemId', { subSystemId: subSystem.id })
            .andWhere('department.relatedType = :systemType', { systemType: 'subsystem' })
            .andWhere('department.deletedAt IS NULL')
            .getMany();

        return departemants;
    }

    async test(systemId: string) {
        const query = await this.agentRepository
            .createQueryBuilder('agents')
            .leftJoinAndMapOne('agents.system', SystemEntity, 'system', 'CAST(system.id AS VARCHAR) = agents.relatedId AND agents.relatedType = :systemType', {
                systemType: 'system',
            })
            .leftJoinAndMapOne(
                'system.subSystem',
                SubSystemEntity,
                'subSystem',
                'CAST(subSystem.id AS varchar) = agents.relatedId AND agents.relatedType = :subSystemType',
                {
                    subSystemType: 'subsystem',
                },
            )
            .where('system.id = :systemId', { systemId })
            .getMany();
        return query;
    }

    async getOperator(operatorId: string, systemId: string) {
        const operator = await this.agentRepository.findOne({
            where: { agentId: operatorId, deletedAt: IsNull(), relatedId: systemId },
        });
        return operator;
    }

    async findFullDataSystem(systemId: string) {
        const query = await this.systemRepository
            .createQueryBuilder('system')
            .leftJoinAndMapOne('system.agents', AgentsEntity, 'agents', 'CAST(system.id AS VARCHAR) = agents.relatedId AND agents.relatedType = :systemType', {
                systemType: 'system',
            })
            .leftJoinAndSelect('system.subSystems', 'subSystems')
            .where('system.id = :systemId', { systemId })
            .getOne();
        return query;
    }

    async findSystemWithSubSystems(systemId: string): Promise<SystemEntity> {
        return this.systemRepository.findOne({
            where: { id: systemId, deletedAt: IsNull() },
            relations: ['subSystems'],
        });
    }

    async findAdminById(agentId: string, relatedId: string): Promise<AgentsEntity> {
        const result = this.agentRepository.findOne({ where: { agentId, relatedId, role: Role.ADMIN } });
        return result;
    }

    async findSubsystemAndAgent(id: string) {
        try {
            const subSystem = await this.subSystemRepository
                .createQueryBuilder('subSystem')
                .leftJoinAndSelect('subSystem.system', 'system')
                .andWhere('subSystem.id = :id', { id })
                .andWhere('subSystem.deletedAt IS NULL')
                .getOne();

            const agents = await this.agentRepository
                .createQueryBuilder('agent')
                .where('agent.relatedId = :subSystemId', { subSystemId: subSystem.id })
                .andWhere('agent.relatedType = :systemType', { systemType: 'subsystem' })
                .getMany();

            return { subSystem, agents };
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }

}
