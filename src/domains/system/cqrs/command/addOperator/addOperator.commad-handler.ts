import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerError, Invalid_Input } from 'src/common/translates/Error.Translate';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { SystemService } from 'src/domains/system/system.service';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';
import { AddOperatorCommand } from './addOperator.commad';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';

@CommandHandler(AddOperatorCommand)
export class AddOperatorCommandHandler implements ICommandHandler<AddOperatorCommand> {
    constructor(private readonly systemService: SystemService) {}
    async execute(command: AddOperatorCommand): Promise<any> {
        const { operatorId, operatorName} = command.body;
        const { audience, section } = command.req.user;
        try {
            let owner: SystemEntity | SubSystemEntity;
            let relatedType: sectionTypeEnum;
            if (section === sectionTypeEnum.SYSTEM) {
                owner = await this.systemService.findSystemById(audience);
                if (!owner) {
                    const Err = Invalid_Input('این سامانه  موجود نیست', 'This system  does not exist');
                    throw new HttpException(Err, Err.status_code);
                }
                relatedType = sectionTypeEnum.SYSTEM;
            } else {
                owner = await this.systemService.findSubsystem(audience);
                relatedType = sectionTypeEnum.SUBSYSTEM;
                if (!owner) {
                    const Err = Invalid_Input('این زیر سامانه موجود نیست', 'This subsystem does not exist');
                    throw new HttpException(Err, Err.status_code);
                }
            }
            const operator = new AgentsEntity();
            operator.name = operatorName;
            operator.role = Role.OPERATOR;
            operator.agentId = operatorId;
            operator.relatedId = owner.id;
            operator.relatedType = relatedType;
            await operator.save();
            return operator;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
