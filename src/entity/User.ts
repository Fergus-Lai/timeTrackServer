import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Time} from "./Time";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    userName: string;

    @OneToMany(type=>Time, time => time.user)
    times : Time[];

}
