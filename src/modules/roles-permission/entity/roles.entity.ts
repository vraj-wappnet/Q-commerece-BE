
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({unique : true})
    name : string;

    @Column({nullable : true})
    description : string;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
        name : "role_permissions",
        joinColumns : [{name : "roleid" , referencedColumnName : "id"}],
        inverseJoinColumns : [{name : "permissionid" , referencedColumnName : "id"}]
    })
    permissions : Permission[];
}
