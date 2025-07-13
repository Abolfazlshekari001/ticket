import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalid_Input, InternalServerError } from 'src/common/translates/Error.Translate';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { SystemService } from 'src/domains/system/system.service';
import { Repository } from 'typeorm';
import { DeleteSubSystemsToSystemCommand } from './deleteSubsystemForSystem.command';

@CommandHandler(DeleteSubSystemsToSystemCommand)
export class DeleteSubSystemsToSystemCommandHandler implements ICommandHandler<DeleteSubSystemsToSystemCommand> {
    constructor(
        @InjectRepository(SystemEntity)
        private readonly systemRepository: Repository<SystemEntity>,
        @InjectRepository(AgentsEntity)
        private readonly agentRepository: Repository<AgentsEntity>,
        @InjectRepository(SubSystemEntity)
        private readonly subSystemRepository: Repository<SubSystemEntity>,
        private readonly systemService: SystemService,
    ) {}
    async execute(command: DeleteSubSystemsToSystemCommand): Promise<any> {
        const { audience } = command.req.user;
        const { subsystemId } = command;
        try {
            const system = await this.systemService.findSystem(audience);
            if (!system) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }

            const { subSystem, agents } = await this.systemService.findSubSystemForSystemById(subsystemId, system.id);
            if (!subSystem) {
                const Err = Invalid_Input('این  زیرسامانه موجود نیست', 'this  subSystem not exist');
                throw new HttpException(Err, Err.status_code);
            }

            subSystem.deletedAt = new Date();
            await this.subSystemRepository.save(subSystem);

            for (const agent of agents) {
                agent.deletedAt = new Date();
                await this.agentRepository.save(agent);
            }

            return subSystem;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else {
                throw error;
            }
        }
    }
}
