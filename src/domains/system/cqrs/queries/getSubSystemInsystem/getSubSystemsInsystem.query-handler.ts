import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InternalServerError, Invalid_Input } from 'src/common/translates/Error.Translate';
import { SystemService } from 'src/domains/system/system.service';
import { GetSubSystemsToSystemQuery } from './getSubSystemsInsystem.query';

@QueryHandler(GetSubSystemsToSystemQuery)
export class GetSubSystemToSystemQueryHandler implements IQueryHandler<GetSubSystemsToSystemQuery> {
    constructor(private readonly systemService: SystemService) {}
    async execute(query: GetSubSystemsToSystemQuery): Promise<any> {
        const { audience } = query.req.user;
        const { referenceId } = query;
        try {
            const system = await this.systemService.findSystem(audience);
            if (!system) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }
            const subSystems = await this.systemService.findSubSystemForSystemByRefrenceId(referenceId, system.id);
            if (!subSystems) {
                const Err = Invalid_Input('این  زیرسامانه موجود نیست', 'this  subSystem not exist');
                throw new HttpException(Err, Err.status_code);
            }
            return subSystems;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
