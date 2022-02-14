import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Time} from "./Time";
import { Category } from "./Category";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column()
    userName: string;

    @OneToMany(type=>Time, time => time.user)
    times : Time[];

    @OneToMany(type=>Category, category => category.user)
    categories : Category[];

}
