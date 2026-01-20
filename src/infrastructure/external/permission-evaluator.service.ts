import { Injectable } from '@nestjs/common';
import { IPermissionEvaluator } from '../../application/ports/permission-evaluator.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { PrismaService } from '../database/prisma.service';
import { ConditionEvaluator } from '../../shared/utils/condition-evaluator.util';

@Injectable()
export class PermissionEvaluator implements IPermissionEvaluator {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    for (const userRole of user.roles) {
      for (const rolePermission of userRole.role.permissions) {
        const permission = rolePermission.permission;
        
        if (permission.resource === resource && permission.action === action) {
          if (!permission.conditions) return true;
          
          if (this.evaluateConditions(permission.conditions, context)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  evaluateConditions(conditions: any, context: any): boolean {
    return ConditionEvaluator.evaluate(conditions, context);
  }
}
