import { Injectable } from '@nestjs/common';
import { RemovePermissionsCommand } from './remove-permissions.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../domain/interfaces/role-permission-repository.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';

@Injectable()
export class RemovePermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(command: RemovePermissionsCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    await this.rolePermissionRepository.removePermissions(
      command.roleId,
      command.permissionIds,
    );
  }
}
