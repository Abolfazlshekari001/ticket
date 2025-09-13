import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as uuid from 'uuid';
import { InternalServerError, Invalid_Input } from 'src/common/translates/Error.Translate';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { Connection } from 'typeorm';
import { SystemService } from 'src/domains/system/system.service';
import { AddSystemCommand } from './addSystem.command';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { JwtService } from '@nestjs/jwt';
@CommandHandler(AddSystemCommand)
export class AddSystemCommandHandler implements ICommandHandler<AddSystemCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly systemService: SystemService,
        private readonly connection: Connection,
    ) {}
    async execute(command: AddSystemCommand): Promise<any> {
        const { userName, password, systemName, adminId } = command.body;

        try {
            const exsitSystem = await this.systemService.findSystemByUsername(userName);
            if (exsitSystem) {
                const Err = Invalid_Input(' این نام کاربری موجود هست ', 'this userName  already exist');
                throw new HttpException(Err, Err.status_code);
            }

            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const system = new SystemEntity();
                system.userName = userName;
                system.password = password;
                system.systemName = systemName;
                const res = await queryRunner.manager.save(system);

                const payload = {
                    aud: res.id,
                    jti: uuid.v4().replace(/-/g, ''),
                    iat: Math.floor(Date.now() / 1000),
                    nbf: Math.floor(Date.now() / 1000),
                    sub: '',
                    section: 'system',
                };
                const apiKey = await this.jwtService.sign(payload, { expiresIn: '100y' });
                res.apiKey = apiKey;
                await queryRunner.manager.save(res);

                const agent = new AgentsEntity();
                agent.agentId = adminId;
                agent.role = Role.ADMIN;
                agent.relatedId = system.id;
                agent.relatedType = sectionTypeEnum.SYSTEM;
                await queryRunner.manager.save(agent);
                await queryRunner.commitTransaction();

                return res;
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
