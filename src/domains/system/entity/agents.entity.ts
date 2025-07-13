import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { TicketEntity } from 'src/domains/ticket/entity/ticket.entity';
import { MessageEntity } from 'src/domains/ticket/entity/message.entity';
import { sectionTypeEnum } from './enum/sectionType.emun';
import { Role } from './enum/agent-role.enum';

@Entity('agents')
export class AgentsEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ nullable: false })
    role: Role;

    @ApiProperty()
    @Column({ nullable: false })
    agentId: string;

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

    @Column()
    relatedId: string;

    @Column({
        type: 'enum',
        enum: sectionTypeEnum,
    })
    relatedType: sectionTypeEnum;

    @OneToMany(() => TicketEntity, (ticket) => ticket.operator)
    tickets: TicketEntity[];

    @OneToMany(() => MessageEntity, (message) => message.agent)
    messages: MessageEntity[];
}