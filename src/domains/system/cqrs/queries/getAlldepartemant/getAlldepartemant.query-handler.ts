import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Invalid_Input, InternalServerError, DataNotFound, Data_NotFound } from 'src/common/translates/Error.Translate';
import { SystemService } from 'src/domains/system/system.service';
import { GetAllDepartemantQuery } from './getAlldepartemant.query';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';

@QueryHandler(GetAllDepartemantQuery)
export class GetAllDepartemantQueryHandler implements IQueryHandler<GetAllDepartemantQuery> {
    constructor(private readonly systemService: SystemService) {}
    async execute(query: GetAllDepartemantQuery): Promise<any> {
        const { sectionType } = query;
        const { audience } = query.req.user;
        let departemants    
        try {
            const exitSubSystem = await this.systemService.findSubsystem(audience);
            if (!exitSubSystem) {
                const Err = Data_NotFound('این زیرسامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }
            if (sectionType === sectionTypeEnum.SYSTEM) {
                departemants = await this.systemService.getAllDepartemantForSystem(exitSubSystem.system.id);
                if (!departemants) {
                    const Err = Data_NotFound('دپارتمانی برای این سامانه ثبت نشده', 'Department is not registered for this system');
                    throw new HttpException(Err, Err.status_code);
                }
            } else if (sectionType === sectionTypeEnum.SUBSYSTEM) {
                departemants = await this.systemService.getAllDepartemantForSubSystem(exitSubSystem.referenceId, exitSubSystem.system.id);
                if (!departemants) {
                    const Err = Data_NotFound('دپارتمانی برای این زیرسامانه ثبت نشده', 'Department is not registered for this system');
                    throw new HttpException(Err, Err.status_code);
                }
            }else{
                const Err = Invalid_Input('بخش وارد شده نادرست است', 'The field entered is incorrect');
                    throw new HttpException(Err, Err.status_code);
            }

            return departemants;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
