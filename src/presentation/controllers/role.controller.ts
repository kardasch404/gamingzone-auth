import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { AssignPermissionsUseCase } from '../../application/use-cases/assign-permissions.use-case';
import { CreateRoleDto } from '../../application/dto/create-role.dto';
import { AssignPermissionsDto } from '../../application/dto/assign-permissions.dto';
import { RoleResponseDto } from '../../application/dto/role-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly assignPermissionsUseCase: AssignPermissionsUseCase,
  ) {}

  @Post()
  @RequirePermission('roles', 'create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.createRoleUseCase.execute(dto);
  }

  @Post(':roleId/permissions')
  @RequirePermission('roles', 'update')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  async assignPermissions(
    @Param('roleId') roleId: string,
    @Body() dto: Omit<AssignPermissionsDto, 'roleId'>,
  ): Promise<void> {
    return this.assignPermissionsUseCase.execute({ roleId, ...dto } as AssignPermissionsDto);
  }
}
