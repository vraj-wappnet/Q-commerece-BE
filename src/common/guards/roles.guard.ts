import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../enum/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRole: unknown = user?.role;
    const normalizedRole =
      typeof userRole === "string" ? Number(userRole) : userRole;

    console.log("[RolesGuard] role-debug", {
      path: request?.url,
      requiredRoles: roles,
      rawRole: userRole,
      normalizedRole,
      userId: user?.id,
    });

    return roles.includes(normalizedRole as UserRole);
  }
}
