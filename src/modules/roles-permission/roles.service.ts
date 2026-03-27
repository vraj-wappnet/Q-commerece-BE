import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entity/roles.entity";
import { Permission } from "./entity/permission.entity";
import { Repository, In } from "typeorm";
import { MESSAGES } from '../../common/constant/message';

@Injectable()
export class RolesService {

    constructor(@InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>
    ) { }

    async createRole(name: string, description: string) {
        const role = this.roleRepository.create({
            name,
            description
        })
        const savedRole = await this.roleRepository.save(role)
        return {
            message: MESSAGES.COMMON.POST_SUCCESS,
            data: savedRole
        };
    }

    async createPermisson(name : string , description:string){
        const permission = this.permissionRepository.create({
            name,
            description
        })
        const savedPermission = await this.permissionRepository.save(permission)
        return {
            message: MESSAGES.COMMON.POST_SUCCESS,
            data: savedPermission
        };
    }

    async assignPermissionToRole(roleId: number, permissionIds: number[]){
        const role = await this.roleRepository.findOne({
            where: {id: roleId},
            relations: ["permissions"]
        })

        if (!role) {
            throw new Error('Role not found');
        }

        const permissions = await this.permissionRepository.find({
            where: {id: In(permissionIds)},
        })

        role.permissions = permissions;
        return this.roleRepository.save(role);
    }

    async getRoles(){
        return {
            message: MESSAGES.COMMON.GET_SUCCESS,
            data: await this.roleRepository.find({
                relations : ["permissions"]
            })
        };
    }

    async getPermissions(){
        return {
            message: MESSAGES.COMMON.GET_SUCCESS,
            data: await this.permissionRepository.find()
        };
    }

    async getRoleById(roleId: number){
        return {
            message: MESSAGES.COMMON.GET_SUCCESS,
            data: await this.roleRepository.findOne({
                where: { id: roleId },
                relations: ["permissions"]
            })
        };
    }

    async deleteRole(roleId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ["permissions"]
        });

        if (!role) {
            throw new Error('Role not found');
        }

        // Prevent deletion of ADMIN role
        if (role.name === 'ADMIN') {
            throw new Error('Cannot delete ADMIN role');
        }

        await this.roleRepository.remove(role);
        return {
            message: MESSAGES.COMMON.DELETE_SUCCESS,
            data: { id: roleId }
        };
    }

    async deletePermission(permissionId: number) {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
            relations: ["roles"]
        });

        if (!permission) {
            throw new Error('Permission not found');
        }

        await this.permissionRepository.remove(permission);
        return {
            message: MESSAGES.COMMON.DELETE_SUCCESS,
            data: { id: permissionId }
        };
    }

    async removePermissionFromRole(roleId: number, permissionId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ["permissions"]
        });

        if (!role) {
            throw new Error('Role not found');
        }

        // Remove permission from role_permissions junction table using QueryBuilder
        await this.roleRepository.createQueryBuilder()
            .delete()
            .from("role_permissions")
            .where("roleid = :roleId", { roleId })
            .andWhere("permissionid = :permissionId", { permissionId })
            .execute();

        return {
            message: MESSAGES.COMMON.DELETE_SUCCESS,
            data: { roleId, permissionId }
        };
    }
}
