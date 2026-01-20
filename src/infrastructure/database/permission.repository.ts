import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../../domain/interfaces/permission-repository.interface';
import { Permission } from '../../domain/entities/permission.entity';
import { PrismaService } from './prisma.service';
import { UuidGenerator } from '../../shared/utils/uuid-generator.util';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(private prisma: PrismaService) {}

  async create(permission: Partial<Permission>): Promise<Permission> {
    return this.prisma.permission.create({ 
      data: { 
        id: UuidGenerator.generate(),
        ...permission 
      } as any 
    });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
    });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({ where: { resource } });
  }

  async update(id: string, permission: Partial<Permission>): Promise<Permission> {
    return this.prisma.permission.update({ where: { id }, data: permission as any });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({ where: { id } });
  }
}
