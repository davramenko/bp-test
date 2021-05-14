import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm";

@Entity()
@Unique(['userIdentifier'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column()
    userIdentifier!: string;

    @Column({ type: "enum", enum: ['phone', 'email']})
    idType!: 'phone' | 'email';

    @Column()
    password?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    toJSON() {
        delete this.password;
        return this;
    }
}
