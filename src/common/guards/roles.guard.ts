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

    if (!user || !user.role) return false;

    // Handle both role object and role string/number
    let userRoleValue: number;
    
    if (typeof user.role === 'object' && user.role.name) {
      // Convert role name to enum value
      const roleName = user.role.name.toUpperCase();
      switch (roleName) {
        case 'ADMIN':
          userRoleValue = UserRole.ADMIN;
          break;
        case 'SELLER':
          userRoleValue = UserRole.SELLER;
          break;
        case 'DELIVERY':
          userRoleValue = UserRole.DELIVERY;
          break;
        case 'CUSTOMER':
          userRoleValue = UserRole.CUSTOMER;
          break;
        default:
          return false;
      }
    } else {
      // Handle string or number role
      const normalizedRole =
        typeof user.role === "string" ? Number(user.role) : user.role;
      userRoleValue = normalizedRole as number;
    }

    return roles.includes(userRoleValue as UserRole);
  }
}
