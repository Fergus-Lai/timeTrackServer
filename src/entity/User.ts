import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Time} from "./Time";
import { Category } from "./Category";
import { pbkdf2Sync} from "crypto";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column()
    userName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(type=>Time, time => time.user)
    times : Time[];

    @OneToMany(type=>Category, category => category.user)
    categories : Category[];

    @Column()
    salt:string;

    validPassword(password:string) {
        var hash = pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
        return this.password === hash;
    };
}
