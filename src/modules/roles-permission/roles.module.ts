import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { PermissionGuard } from "./permission.guard";
import { Role } from "./entity/roles.entity";
import { Permission } from "./entity/permission.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Permission])
    ],
    controllers: [RolesController],
    providers: [RolesService,
        PermissionGuard],
    exports: [RolesService, TypeOrmModule],
})
export class RolesPermissionModule { }