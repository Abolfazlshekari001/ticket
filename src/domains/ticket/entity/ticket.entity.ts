import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    JoinColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { priorirtyType } from './enum/priorirtyType.enum';
import { statusType } from './enum/statusType.enum';
import { DepartmentEntity } from 'src/domains/system/entity/department.entity';
import { MessageEntity } from './message.entity';
import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
@Entity('ticket')
export class TicketEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: priorirtyType,
    })
    @ApiProperty({
        description: 'Type of the  priorirty',
        enum: priorirtyType,
        example: 'NORMAL',
    })
    priorirty: priorirtyType;

    @Column({
        type: 'enum',
        enum: statusType,
    })
    @ApiProperty({
        description: 'Type of the  status',
        enum: statusType,
        example: 'OPEN',
    })
    status: statusType;

    @ApiProperty()
    @Column({ nullable: true })
    userId: string;

    @ApiProperty()
    @Column({ nullable: true })
    name: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @ManyToOne(() => AgentsEntity, (operator) => operator.tickets)
    @JoinColumn({ referencedColumnName: 'id', name: 'operatorId' })
    @ApiProperty({
        type: () => AgentsEntity,
    })
    operator: AgentsEntity;

    @ManyToOne(() => DepartmentEntity, (department) => department.ticket)
    @JoinColumn({ referencedColumnName: 'id', name: 'departmentId' })
    @ApiProperty({
        type: () => DepartmentEntity,
    })
    department: DepartmentEntity;

    @OneToMany(() => MessageEntity, (message) => message.ticket)
    message: MessageEntity[];

    @Column()
    sectionId: string;

    @Column({ default: false })
    operatorSeen: boolean;

    @Column({ default: false })
    userSeen: boolean;

    @Column({
        type: 'enum',
        enum: sectionTypeEnum,
    })
    @ApiProperty({
        description: 'Type of the  ticket',
        enum: sectionTypeEnum,
        example: 'system',
    })
    sectionType: sectionTypeEnum;
}
