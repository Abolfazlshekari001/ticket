import { ApiProperty } from '@nestjs/swagger';
import { Column, OneToMany, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, DeleteDateColumn } from 'typeorm';
import { SubSystemEntity } from './subsystem.entity';
@Entity('system')
export class SystemEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ nullable: false, unique: true })
    userName: string;
    
    @ApiProperty()
    @Column({ nullable: false, unique: true })
    systemName:string

    @ApiProperty()
    @Column({ nullable: false })
    password: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @OneToMany(() => SubSystemEntity, (subSystem) => subSystem.system)
    subSystems: SubSystemEntity[];

    @ApiProperty()
    @Column({ nullable: true })
    apiKey: string
}
