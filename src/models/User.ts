import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany} from "typeorm";
import Orphanage from "./Orphanage";

@Entity('users')
export default class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Orphanage, orphanage => orphanage.user, {
        cascade: ['insert', 'update']
    })
    @JoinColumn({ name: 'users_id' })
    orphanage: Orphanage[];

}