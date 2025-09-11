import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // 사용자가 발행자인지 확인
    if (requiredRoles.includes(Role.ISSUER) && user.isIssuer) {
      return true;
    }

    // 사용자가 관리자인지 확인 (추후 구현)
    if (requiredRoles.includes(Role.ADMIN) && user.isAdmin) {
      return true;
    }

    return requiredRoles.some((role) => user.role?.includes(role));
  }
}