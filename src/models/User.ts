import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['userIdentifier'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    public id!: number;

    @Column()
    public userIdentifier!: string;

    @Column({ type: 'enum', enum: ['phone', 'email'] })
    public idType!: 'phone' | 'email';

    @Column()
    public password?: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    public toJSON(): any {
        delete this.password;
        return this;
    }
}
