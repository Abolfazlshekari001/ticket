import { HttpException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InternalServerError, Invalid_Input } from 'src/common/translates/Error.Translate';
import { GetSystemQuery } from './getSystem.query';
import { SystemService } from 'src/domains/system/system.service';

@QueryHandler(GetSystemQuery)
export class GetSystemQueryHandler implements IQueryHandler<GetSystemQuery> {
    constructor(private readonly systemService: SystemService) {}
    async execute(query: GetSystemQuery): Promise<any> {
        const { audience } = query.req.user;
        try {
            const exitSystem = await this.systemService.findFullDataSystem(audience);

            if (!exitSystem) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }
            delete exitSystem['userName'];
            delete exitSystem['password'];
            return exitSystem;
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}
