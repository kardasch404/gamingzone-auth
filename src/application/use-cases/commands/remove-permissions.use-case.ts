import { Injectable } from '@nestjs/common';
import { RemovePermissionsCommand } from './remove-permissions.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../domain/interfaces/role-permission-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { PermissionsRemovedEvent } from '../../../domain/events/permissions-removed.event';

@Injectable()
export class RemovePermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly eventBus: IEventBus,
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
    await this.eventBus.publish(new PermissionsRemovedEvent(command.roleId, command.permissionIds));
  }
}
