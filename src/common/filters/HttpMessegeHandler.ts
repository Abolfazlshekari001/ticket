import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

import { Request, Response } from 'express';
import {
    Bad_Request_Exception,
    DataNotFound,
    Data_NotFound,
    InternalServerError,
    Invalid_Input,
    NotFound,
    Unauthorized,
    forbiddenResource,
} from '../translates/Error.Translate';
import { Request_Was_Successful, Request_Was_Successful1 } from '../translates/successful.Translate';
import { compilerLogger, infoLogger } from '../utils/logger/winston-logger-config';

/* دکوریتور @Catch برای اعمال فیلتر بر روی انواع خاصی از استثنائات*/
@Catch(HttpException)
/* پیاده‌سازی رابط ExceptionFilter برای ساختن یک فیلتر استثنائات*/
export class HttpExceptionFilter implements ExceptionFilter {
    /* متد catch برای کنترل و پردازش استثنائات*/
    catch(exception, host: ArgumentsHost) {
        /* دریافت کانتکست هاست و ورودی‌ها*/
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        /* دریافت اطلاعات خطا از استثناء و زبان درخواست*/
        const generalError = exception.getResponse();
        let language = request.headers['language'] as string;
        if (!language) {
            language = 'en';
        }
        let result;
        let message: string;
        /* بررسی نوع استثناء و تولید پاسخ و پیام متناظر*/
        switch (true) {
            /* اگر استثناء دارای پاسخ (response) باشد*/
            case generalError.response !== undefined:
                result = {
                    status_code: generalError.response.status_code,
                    error_code: generalError.response.code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
                message = generalError.response.message[language];
                break;

            /*(ok)اگر استثناء نوع 201 باشد*/
            case generalError.status_code === 200:
                result = {
                    success: true,
                    status_code: generalError.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
                message = generalError.message[language];
                break;
            /* (Created)اگر استثناء نوع 201باشد*/
            case exception.status === 201:
                result = {
                    success: true,
                    status_code: Request_Was_Successful.status_code,
                    error_code: Request_Was_Successful.code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: exception.getResponse().message,
                };
                message = Request_Was_Successful.message[language];
                break;

            /* (Bad Request Exception)اگر استثناء نوع 400باشد*/
            case exception.status === 400:
                const messagedev = exception.getResponse().message !== undefined ? exception.getResponse().message : exception.getResponse().message_developer;
                const formaterr = Bad_Request_Exception(messagedev['fa'], messagedev['en']);
                result = {
                    success: false,
                    status_code: formaterr.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: messagedev,
                };
                message = formaterr.message[language];
                break;
            //(not found)
            case exception.status === 409:
                const messagedev409 =
                    exception.getResponse().message !== undefined ? exception.getResponse().message : exception.getResponse().message_developer;
                const format409 = Data_NotFound(messagedev409['fa'], messagedev409['en']);
                result = {
                    success: false,
                    status_code: format409.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: messagedev409,
                };
                message = format409.message[language];
                break;

            // case exception.status === 409:
            //   result = {
            //     status_code: DataNotFound.status_code,
            //     error_code: DataNotFound.code,
            //     timestamp: new Date().toISOString(),
            //     path: request.url,
            //     message_developer: exception.getResponse().message,
            //   };
            //   message = DataNotFound.message[language];
            //   break;

            case exception.status === 201:
                const format2 = Request_Was_Successful1(exception.additional_info);
                result = {
                    success: true,
                    status_code: format2.status_code,
                    error_code: format2.code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: exception.getResponse().message,
                };
                message = Request_Was_Successful.message[language];
                break;

            /* (Unauthorized)اگر استثناء نوع 401باشد*/
            case exception.status === 401:
                const messagedev401 =
                    exception.getResponse().message !== undefined ? exception.getResponse().message : exception.getResponse().message_developer;
                const format401 = Unauthorized(messagedev401['fa'], messagedev401['en']);
                result = {
                    success: false,
                    status_code: format401.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: messagedev401,
                };
                message = format401.message[language];
                break;

            /* (Forbidden)اگر استثناء نوع 403باشد*/
            case exception.status === 403:
                result = {
                    status_code: forbiddenResource.status_code,
                    error_code: forbiddenResource.code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: exception.getResponse().message ? exception.getResponse().message : exception.getResponse().message_developer,
                };
                message = forbiddenResource.message[language];
                break;
            /* (NotFound)اگر استثناء نوع 404باشد*/
            case exception.statusCode === 404 || exception.status === 404:
                const messagedev404 =
                    exception.getResponse().message !== undefined ? exception.getResponse().message : exception.getResponse().message_developer;
                const format404 = NotFound(messagedev404['fa'], messagedev404['en']);
                result = {
                    success: false,
                    status_code: format404.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: messagedev404,
                };
                message = format404.message[language];
                break;

            /* (Invalid Input)اگر استثناء نوع 422باشد*/
            case exception.status === 422:
                const messagedev422 =
                    exception.getResponse().message !== undefined ? exception.getResponse().message : exception.getResponse().message_developer;
                const format422 = Invalid_Input(messagedev422['fa'], messagedev422['en']);
                result = {
                    success: false,
                    status_code: format422.status_code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: messagedev422,
                };
                message = format422.message[language];
                break;

            /* (Internal Server Error)اگر استثناء نوع 500باشد*/
            case exception.status === 500:
                const format = InternalServerError(exception.response['en']);
                result = {
                    success: false,
                    status_code: format.status_code,
                    error_code: format.code,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message_developer: exception.getResponse(),
                };
                message = format.message[language];
                break;
        }

        // ارسال پاسخ به کلاینت با استفاده از پاسخ‌دهنده و ذخیره لاگ‌ها
        response.status(result.status_code).json({ success: result.success, result: result, message: message });

        /* اگر استثناء نوع 500 باشد، لاگ اطلاعات در فایل compiler.log نوشته می‌شود،
     info.log در غیر اینصورت در فایل*/
        if (result.status_code === 500) {
            compilerLogger.compiler(result);
        } else {
            infoLogger.info(result);
        }
    }
}
