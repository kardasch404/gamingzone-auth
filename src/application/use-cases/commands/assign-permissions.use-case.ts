import { Injectable } from '@nestjs/common';
import { AssignPermissionsCommand } from './assign-permissions.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../domain/interfaces/role-permission-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { PermissionsAssignedEvent } from '../../../domain/events/permissions-assigned.event';

@Injectable()
export class AssignPermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly eventBus: IEventBus,
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
    await this.eventBus.publish(new PermissionsAssignedEvent(command.roleId, command.permissionIds));
  }
}
