import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { Role } from "./entity/roles.entity";
import { Permission } from "./entity/permission.entity";
import { Permission as PermissionDecorator } from "./permissions.decorator";

@ApiTags("Roles & Permissions")
@Controller("roles")
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    @ApiOperation({ summary: "Get all roles with permissions" })
    @ApiResponse({ 
        status: 200, 
        description: "List of all roles with their permissions",
        type: [Role]
    })
    async getRoles() {
        return this.rolesService.getRoles();
    }

    @Post()
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create a new role" })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    example: "MODERATOR",
                    description: "Role name"
                },
                description: {
                    type: "string",
                    example: "Moderator with limited admin access",
                    description: "Role description"
                }
            },
            required: ["name"]
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: "Role created successfully",
        type: Role
    })
    async createRole(@Body() body: { name: string; description?: string }) {
        return this.rolesService.createRole(body.name, body.description || '');
    }

    @Post("permissions")
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create a new permission" })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    example: "MANAGE_CATEGORIES",
                    description: "Permission name"
                },
                description: {
                    type: "string",
                    example: "Create, update, and delete categories",
                    description: "Permission description"
                }
            },
            required: ["name"]
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: "Permission created successfully",
        type: Permission
    })
    async createPermission(@Body() body: { name: string; description?: string }) {
        return this.rolesService.createPermisson(body.name, body.description || '');
    }

    @Put(":roleId/permissions")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Assign permissions to a role" })
    @ApiParam({
        name: "roleId",
        description: "Role ID",
        example: 1
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                permissionIds: {
                    type: "array",
                    items: { type: "number" },
                    example: [1, 2, 3],
                    description: "Array of permission IDs to assign"
                }
            },
            required: ["permissionIds"]
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: "Permissions assigned successfully",
        type: Role
    })
    async assignPermissions(
        @Param("roleId", ParseIntPipe) roleId: number,
        @Body() body: { permissionIds: number[] }
    ) {
        const permissionIds = (body.permissionIds || []).map((id) => Number(id));
        return this.rolesService.assignPermissionToRole(roleId, permissionIds);
    }

    @Get("permissions")
    @ApiOperation({ summary: "Get all permissions" })
    @ApiResponse({ 
        status: 200, 
        description: "List of all permissions",
        type: [Permission]
    })
    async getPermissions() {
        return this.rolesService.getPermissions();
    }

    @Get(":roleId")
    @ApiOperation({ summary: "Get role by ID with permissions" })
    @ApiParam({
        name: "roleId",
        description: "Role ID",
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: "Role details with permissions",
        type: Role
    })
    async getRole(@Param("roleId", ParseIntPipe) roleId: number) {
        return this.rolesService.getRoleById(roleId);
    }

    @Delete(":roleId")
    @ApiBearerAuth()
    @PermissionDecorator("DELETE_USER")
    @ApiOperation({ summary: "Delete a role (Admin only)" })
    @ApiParam({
        name: "roleId",
        description: "Role ID to delete",
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: "Role deleted successfully"
    })
    @ApiResponse({ 
        status: 403, 
        description: "Admin access required"
    })
    async deleteRole(@Param("roleId", ParseIntPipe) roleId: number) {
        return this.rolesService.deleteRole(roleId);
    }

    @Delete("permissions/:permissionId")
    @ApiBearerAuth()
    @PermissionDecorator("DELETE_USER")
    @ApiOperation({ summary: "Delete a permission (Admin only)" })
    @ApiParam({
        name: "permissionId",
        description: "Permission ID to delete",
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: "Permission deleted successfully"
    })
    @ApiResponse({ 
        status: 403, 
        description: "Admin access required"
    })
    async deletePermission(@Param("permissionId", ParseIntPipe) permissionId: number) {
        return this.rolesService.deletePermission(permissionId);
    }

    @Delete(":roleId/permissions/:permissionId")
    @ApiBearerAuth()
    @PermissionDecorator("DELETE_USER")
    @ApiOperation({ summary: "Remove permission from role (Admin only)" })
    @ApiParam({
        name: "roleId",
        description: "Role ID",
        example: 1
    })
    @ApiParam({
        name: "permissionId",
        description: "Permission ID to remove",
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: "Permission removed from role successfully"
    })
    @ApiResponse({ 
        status: 403, 
        description: "Admin access required"
    })
    async removePermissionFromRole(
        @Param("roleId", ParseIntPipe) roleId: number,
        @Param("permissionId", ParseIntPipe) permissionId: number
    ) {
        return this.rolesService.removePermissionFromRole(roleId, permissionId);
    }
}
