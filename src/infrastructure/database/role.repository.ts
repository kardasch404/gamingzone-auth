import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { Role } from '../../domain/entities/role.entity';
import { PrismaService } from './prisma.service';
import { UuidGenerator } from '../../shared/utils/uuid-generator.util';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaService) {}

  async create(role: Partial<Role>): Promise<Role> {
    return this.prisma.role.create({ 
      data: { 
        id: UuidGenerator.generate(),
        ...role 
      } as any 
    });
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data: role as any });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
