import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import {User} from "./User"
import { Time } from "./Time";

@Entity()
export class Category {
    
    @PrimaryGeneratedColumn("uuid")
    categoryID : string;

    @Column()
    categoryName : string;

    @Column()
    categoryColor : string;

    @OneToMany(type=>Time, time=>time.category)
    times: Time[]

    @ManyToOne(type=>User, user => user.categories)
    user: User

}