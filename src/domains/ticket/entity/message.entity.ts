import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, JoinColumn, DeleteDateColumn, ManyToOne } from 'typeorm';
import { TicketEntity } from './ticket.entity';
import { AgentsEntity } from 'src/domains/system/entity/agents.entity';
@Entity('message')
export class MessageEntity extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ type: 'text' })
    body: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    attachment: string;

    @ApiProperty()
    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @Column({
        type: 'enum',
        enum: ['operator', 'user', 'admin'],
    })
    senderType: 'operator' | 'user' | 'admin';

    @ManyToOne(() => TicketEntity, (ticket) => ticket.message)
    @JoinColumn({ referencedColumnName: 'id', name: 'ticketId' })
    ticket: TicketEntity;

    @Column()
    senderId: string;

    @ManyToOne(() => AgentsEntity, (agent) => agent.messages, { nullable: true })
    @JoinColumn({ name: 'operatorId' })
    agent: AgentsEntity | null;

    setSenderId() {
        if (this.senderType === 'user') {
            this.senderId = this.ticket.userId;
        } else if (this.senderType === 'operator') {
            this.senderId = this.agent?.id;
        }
    }
}
