import { Injectable } from '@nestjs/common';
import { DeleteRoleCommand } from './delete-role.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../domain/exceptions/system-role.exception';
import { RoleDeletedEvent } from '../../../domain/events/role-deleted.event';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    if (!role.canDelete()) {
      throw new SystemRoleException();
    }

    await this.roleRepository.delete(command.roleId);
    await this.eventBus.publish(new RoleDeletedEvent(role.id, role.name));
  }
}
