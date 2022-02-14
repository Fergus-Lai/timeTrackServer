import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {User} from "./User"

@Entity()
export class Time {

    @PrimaryGeneratedColumn()
    timeID: number;

    @Column({ type: 'timestamp', nullable: false })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column()
    name: string;

    @Column()
    category: string;

    @ManyToOne(type => User, user => user.times)
    user: User;
}