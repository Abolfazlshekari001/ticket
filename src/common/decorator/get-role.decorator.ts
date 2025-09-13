import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/domains/system/entity/enum/agent-role.enum';
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
