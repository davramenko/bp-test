import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('sessions')
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!: number;

    @Column()
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}