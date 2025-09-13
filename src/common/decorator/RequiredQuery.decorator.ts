import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const RequiredQuery = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query[data];
    if (value === undefined) {
        throw new BadRequestException(`Missing required query parameter: ${data}`);
    }
    return value;
});
