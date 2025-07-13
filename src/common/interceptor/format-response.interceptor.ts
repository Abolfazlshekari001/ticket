import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request_Was_Successful } from '../translates/successful.Translate';
import { infoLogger } from '../utils/logger/winston-logger-config';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((value) => {
                let message: any;
                if (value !== null) {
                    if (!value.message) {
                        const request = context.switchToHttp().getRequest<Request>();
                        let language = request.headers['language'] as string;
                        if (language === undefined) language = 'en';
                        message = Request_Was_Successful.message[language];
                    }
                    value = value;
                } else {
                    value = [];
                }
                const result = { success: true, result: value, message: message };
                infoLogger.info(result);
                return result;
            }),
        );
    }
}
