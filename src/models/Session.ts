import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public userId!: number;

    @Column()
    public expiresAt!: Date;

    @CreateDateColumn()
    public createdAt!: Date;
}
