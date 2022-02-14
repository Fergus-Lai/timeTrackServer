import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Category } from "./Category";
import {User} from "./User"

@Entity()
export class Time {

    @PrimaryGeneratedColumn("uuid")
    timeID: string;

    @Column({ type: 'timestamp', nullable: false })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column()
    name: string;

    @ManyToOne(type => User, user => user.times)
    user: User;

    @ManyToOne(type => Category, category => category.times)
    category: Category;
}