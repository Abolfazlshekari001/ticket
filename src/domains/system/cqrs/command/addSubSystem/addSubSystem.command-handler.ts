import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as uuid from 'uuid';
import { InternalServerError, Invalid_Input } from 'src/common/translates/Error.Translate';
import { SystemService } from 'src/domains/system/system.service';
import { Connection } from 'typeorm';
import { AddSubSystemCommand } from './addSubSystem.command';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(AddSubSystemCommand)
export class AddSubSystemCommandHandler implements ICommandHandler<AddSubSystemCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly systemService: SystemService,
        private readonly connection: Connection,
    ) {}
    async execute(command: AddSubSystemCommand): Promise<any> {
        const { name, referenceId, adminId } = command.body;
        const { audience } = command.req.user;
        try {
            const exitSystem = await this.systemService.findSystemById(audience);
            if (!exitSystem) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }
            const checkReferenceID = await this.systemService.findReferenceId(referenceId, audience);
            if (checkReferenceID) {
                const Err = Invalid_Input('این زیر سامانه موجود هست', 'this  subSystem alredy exist');
                throw new HttpException(Err, Err.status_code);
            }
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const subSystem = new SubSystemEntity();
                subSystem.name = name;
                subSystem.referenceId = referenceId;
                subSystem.system = exitSystem;
                const res = await queryRunner.manager.save(subSystem);
                const payload = {
                    aud: res.id,
                    jti: uuid.v4().replace(/-/g, ''),
                    iat: Math.floor(Date.now() / 1000),
                    nbf: Math.floor(Date.now() / 1000),
                    sub: '',
                    section: 'subsystem',
                };
                const apiKey = await this.jwtService.sign(payload, { expiresIn: '100y' });
                res.apiKey = apiKey;
                await queryRunner.manager.save(res);

                const agent = new AgentsEntity();
                agent.agentId = adminId;
                agent.role = Role.ADMIN;
                agent.relatedId = subSystem.id;
                agent.relatedType = sectionTypeEnum.SUBSYSTEM;
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
