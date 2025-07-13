import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemEntity } from './entity/system.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { AddSystemCommandHandler } from './cqrs/command/addSystem/addSystem.command-handler';
import { SubSystemEntity } from './entity/subsystem.entity';
import { AddSubSystemCommandHandler } from './cqrs/command/addSubSystem/addSubSystem.command-handler';
import { AddOperatorCommandHandler } from './cqrs/command/addOperator/addOperator.commad-handler';
import { AgentsEntity } from './entity/agents.entity';
import { AddDepartemantCommandHandler } from './cqrs/command/addDepartemant/addDepartemant.command-handler';
import { DepartmentEntity } from './entity/department.entity';
import { GetSystemQueryHandler } from './cqrs/queries/getSystem/getSystem.query-handler';
import { GetSubSystemToSystemQueryHandler } from './cqrs/queries/getSubSystemInsystem/getSubSystemsInsystem.query-handler';
import { GetAllDepartemantQueryHandler } from './cqrs/queries/getAlldepartemant/getAlldepartemant.query-handler';
import { DeleteSystemCommandHandler } from './cqrs/command/deleteSystem/deleteSystem.command-handler';
import { DeleteSubSystemsToSystemCommandHandler } from './cqrs/command/deleteSubsystemForSystem/deleteSubsystemForSystem.command-handler';
import { JwtStrategy } from 'src/common/jwt_strategy/jwt.sterategy';
import { GetAllDepartemantSystemQueryHandler } from './cqrs/queries/getAllDepartmentSystem/getAllDepartmentSystem.query-handler';

export const QueriesHandlers = [
    GetSystemQueryHandler,
    GetSubSystemToSystemQueryHandler,
    GetAllDepartemantQueryHandler,
    DeleteSubSystemsToSystemCommandHandler,
    GetAllDepartemantSystemQueryHandler
];
export const CommandHandlers = [
    AddSystemCommandHandler,
    AddSubSystemCommandHandler,
    AddOperatorCommandHandler,
    AddDepartemantCommandHandler,
    DeleteSystemCommandHandler,
];
@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([SystemEntity, SubSystemEntity, AgentsEntity, DepartmentEntity]),
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [SystemController],
    providers: [SystemService,JwtStrategy, ...CommandHandlers, ...QueriesHandlers],
    exports: [SystemService, ...CommandHandlers, ...QueriesHandlers],
})
export class SystemModule {}
