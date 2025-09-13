import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';
import { SystemService } from 'src/domains/system/system.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly systemService: SystemService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const agentId = request.query.agentId;
        const agent = await this.systemService.findAgentById(agentId, request.user.audience);
        if (!agent) {
            return false;
        }
        return requiredRoles.includes(agent.role);
    }
}
