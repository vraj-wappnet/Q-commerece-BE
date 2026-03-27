import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PERMISSION_KEY } from "./permissions.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const permission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());

        if (!permission) {
            return true; // No permission required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new UnauthorizedException('User not authenticated or role not found');
        }

        // Check if user has the required permission
        const hasPermission = user.role.permissions?.some(
            (p) => p.name === permission,
        );

        if (!hasPermission) {
            throw new UnauthorizedException(`Insufficient permissions. Required: ${permission}`);
        }

        return true;
    }
}
