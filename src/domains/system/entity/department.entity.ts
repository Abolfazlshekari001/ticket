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
    OneToOne,
    OneToMany,
} from 'typeorm';
import { PolymorphicParent } from 'typeorm-polymorphic';
import { SubSystemEntity } from './subsystem.entity';
import { SystemEntity } from './system.entity';
import { TicketEntity } from 'src/domains/ticket/entity/ticket.entity';
import { sectionTypeEnum } from './enum/sectionType.emun';
@Entity('department')
export class DepartmentEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    tite: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @OneToMany(() => TicketEntity, (ticket) => ticket.department)
    ticket: TicketEntity[];

    @Column()
    relatedId: string;
    
    @Column({
        type: 'enum',
        enum: sectionTypeEnum,
    })
    relatedType: sectionTypeEnum;
}
