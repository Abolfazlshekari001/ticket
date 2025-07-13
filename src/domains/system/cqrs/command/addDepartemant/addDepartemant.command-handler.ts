import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerError, Invalid_Input, NotFound } from 'src/common/translates/Error.Translate';
import { SystemEntity } from 'src/domains/system/entity/system.entity';
import { SystemService } from 'src/domains/system/system.service';
import { Repository } from 'typeorm';
import { SubSystemEntity } from 'src/domains/system/entity/subsystem.entity';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { AddDepartemantCommand } from './addDepartemant.command';
import { DepartmentEntity } from 'src/domains/system/entity/department.entity';

@CommandHandler(AddDepartemantCommand)
export class AddDepartemantCommandHandler implements ICommandHandler<AddDepartemantCommand> {
    constructor(
        @InjectRepository(DepartmentEntity)
        private readonly departemantRepository: Repository<DepartmentEntity>,
        private readonly systemService: SystemService,
    ) {}
    async execute(command: AddDepartemantCommand): Promise<any> {
        const { title } = command.body;
        const { audience, section } = command.req.user;
        try {
            let owner: SystemEntity | SubSystemEntity;
            let relatedType: sectionTypeEnum;
            if (section === sectionTypeEnum.SYSTEM) {
                owner = await this.systemService.findSystemById(audience);
                if (!owner) {
                    const err = NotFound('این سامانه وجود ندارد', 'This system does not exist');
                    throw new HttpException(err, err.status_code);
                }
                relatedType = sectionTypeEnum.SYSTEM;
            } else {
                owner = await this.systemService.findSubsystem(audience);
                if (owner) {
                    relatedType = sectionTypeEnum.SUBSYSTEM;
                } else {
                    const Err = Invalid_Input('این سامانه یا زیر سامانه موجود نیست', 'This system or subsystem does not exist');
                    throw new HttpException(Err, Err.status_code);
                }
            }
            let departemant = new DepartmentEntity();
            departemant.tite = title;
            departemant.relatedId = owner.id;
            departemant.relatedType = relatedType;
            await departemant.save();
            return departemant;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
