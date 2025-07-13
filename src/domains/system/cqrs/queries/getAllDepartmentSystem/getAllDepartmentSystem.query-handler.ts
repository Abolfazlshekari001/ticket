import { HttpException } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Invalid_Input, InternalServerError, Data_NotFound } from "src/common/translates/Error.Translate";
import { SystemService } from "src/domains/system/system.service";
import { GetAllDepartemantSystemQuery } from "./getAllDepartmentSystem.query";

@QueryHandler(GetAllDepartemantSystemQuery)
export class GetAllDepartemantSystemQueryHandler implements IQueryHandler<GetAllDepartemantSystemQuery> {
    constructor(private readonly systemService: SystemService) {}
    async execute(query: GetAllDepartemantSystemQuery): Promise<any> {
        const { audience } = query.req.user;
        try {
            const system = await this.systemService.findSystem(audience);
            if (!system) {
                const Err = Invalid_Input('این سامانه موجود نیست', 'this  system not exist');
                throw new HttpException(Err, Err.status_code);
            }
            const departements = await this.systemService.getAllDepartemantForSystem(system.id);
            if(!departements){
                const Err = Data_NotFound('دپارتمانی برای این سامانه ثبت نشده', 'Department is not registered for this system');
                throw new HttpException(Err, Err.status_code);
            }
            return departements
        } catch (error) {
            if (error.status === undefined) {
                const formatError = InternalServerError(error.message);
                throw new HttpException(formatError, formatError.status_code);
            } else throw error;
        }
    }
}