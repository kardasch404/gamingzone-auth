import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { Permission } from '../../../domain/entities/permission.entity';
import { generateId } from '../../../shared/utils/uuid.util';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PermissionController {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @Get()
  async findAll(): Promise<any[]> {
    const permissions = await this.permissionRepository.findByUserId('system');
    return permissions.map(p => ({
      id: p.id,
      resource: p.resource,
      action: p.action,
      description: p.description,
    }));
  }

  @Post()
  async create(
    @Body() dto: { resource: string; action: string; description?: string; conditions?: Record<string, any> },
  ): Promise<any> {
    const permission = Permission.create(generateId(), dto.resource, dto.action, dto.conditions, dto.description);
    await this.permissionRepository.save(permission);
    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    };
  }
}
