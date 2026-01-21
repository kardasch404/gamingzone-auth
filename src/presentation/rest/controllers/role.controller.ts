import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateRoleUseCase } from '../../../application/use-cases/commands/create-role.use-case';
import { UpdateRoleUseCase } from '../../../application/use-cases/commands/update-role.use-case';
import { DeleteRoleUseCase } from '../../../application/use-cases/commands/delete-role.use-case';
import { AssignPermissionsUseCase } from '../../../application/use-cases/commands/assign-permissions.use-case';
import { RemovePermissionsUseCase } from '../../../application/use-cases/commands/remove-permissions.use-case';
import { CreateRoleCommand } from '../../../application/use-cases/commands/create-role.command';
import { UpdateRoleCommand } from '../../../application/use-cases/commands/update-role.command';
import { DeleteRoleCommand } from '../../../application/use-cases/commands/delete-role.command';
import { AssignPermissionsCommand } from '../../../application/use-cases/commands/assign-permissions.command';
import { RemovePermissionsCommand } from '../../../application/use-cases/commands/remove-permissions.command';
import { CreateRoleDto } from '../../../application/dto/request/create-role.dto';
import { UpdateRoleDto } from '../../../application/dto/request/update-role.dto';
import { AssignPermissionsDto } from '../../../application/dto/request/assign-permissions.dto';
import { RoleResponseDto } from '../../../application/dto/response/role-response.dto';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RoleController {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly assignPermissionsUseCase: AssignPermissionsUseCase,
    private readonly removePermissionsUseCase: RemovePermissionsUseCase,
  ) {}

  @Get()
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map(RoleResponseDto.fromDomain);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    return RoleResponseDto.fromDomain(role);
  }

  @Post()
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    const command = new CreateRoleCommand(dto.name, dto.description, dto.isSystem);
    return this.createRoleUseCase.execute(command);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const command = new UpdateRoleCommand(id, dto.name, dto.description);
    return this.updateRoleUseCase.execute(command);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const command = new DeleteRoleCommand(id);
    await this.deleteRoleUseCase.execute(command);
  }

  @Post(':id/permissions')
  async assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto): Promise<void> {
    const command = new AssignPermissionsCommand(id, dto.permissionIds);
    await this.assignPermissionsUseCase.execute(command);
  }

  @Delete(':id/permissions/:permissionId')
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string): Promise<void> {
    const command = new RemovePermissionsCommand(id, [permissionId]);
    await this.removePermissionsUseCase.execute(command);
  }
}
