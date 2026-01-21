import { Injectable } from '@nestjs/common';
import { AssignPermissionsCommand } from './assign-permissions.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../domain/interfaces/role-permission-repository.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';

@Injectable()
export class AssignPermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(command: AssignPermissionsCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    await this.rolePermissionRepository.assignPermissions(
      command.roleId,
      command.permissionIds,
    );
  }
}
