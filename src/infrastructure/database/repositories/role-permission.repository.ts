import { Injectable } from '@nestjs/common';
import { IRolePermissionRepository } from '../../../domain/interfaces/role-permission-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolePermissionRepository implements IRolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  async removePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }
}
