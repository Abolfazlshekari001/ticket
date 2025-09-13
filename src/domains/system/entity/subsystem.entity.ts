import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    JoinColumn,
    Unique,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { SystemEntity } from './system.entity';

@Entity('subSystem')
export class SubSystemEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ nullable: false })
    name: string;

    @ApiProperty()
    @Column({ nullable: false })
    @Unique(['referenceId'])
    referenceId: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @ManyToOne(() => SystemEntity, (system) => system.subSystems)
    @JoinColumn({ referencedColumnName: 'id', name: 'systemId' })
    system: SystemEntity;

    @ApiProperty()
    @Column({ nullable: true })
    apiKey: string;
}
