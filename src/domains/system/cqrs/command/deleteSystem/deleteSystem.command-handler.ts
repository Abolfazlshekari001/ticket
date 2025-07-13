import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Invalid_Input, InternalServerError } from 'src/common/translates/Error.Translate';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { SystemService } from 'src/domains/system/system.service';
import { Repository, Connection } from 'typeorm';
import { DeleteSystemCommand } from './deleteSystem.command';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';

@CommandHandler(DeleteSystemCommand)
export class DeleteSystemCommandHandler implements ICommandHandler<DeleteSystemCommand> {
    constructor(
        @InjectRepository(SystemEntity)
        private readonly systemRepository: Repository<SystemEntity>,
        @InjectRepository(AgentsEntity)
        private readonly agentRepository: Repository<AgentsEntity>,
        @InjectRepository(SubSystemEntity)
        private readonly subSystemRepository: Repository<SubSystemEntity>,
        private readonly systemService: SystemService,
        private readonly connection: Connection,
    ) {}
    async execute(command: DeleteSystemCommand): Promise<any> {
        const { userName, password } = command.body;
        try {
            const { system, agents, subsystems } = await this.systemService.findOneSystem(userName, password);

            if (!system) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this system does not exist');
                throw new HttpException(Err, Err.status_code);
            }

            system.deletedAt = new Date();
            await this.systemRepository.save(system);

            for (const agent of agents) {
                agent.deletedAt = new Date();
                await this.agentRepository.save(agent);
            }

            for (const subsystem of subsystems) {
                subsystem.deletedAt = new Date();
                await this.subSystemRepository.save(subsystem);
            }
            
            return system;
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
