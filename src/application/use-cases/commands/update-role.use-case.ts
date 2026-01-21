import { Injectable } from '@nestjs/common';
import { UpdateRoleCommand } from './update-role.command';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../domain/exceptions/system-role.exception';
import { RoleUpdatedEvent } from '../../../domain/events/role-updated.event';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    if (role.isSystem) {
      throw new SystemRoleException();
    }

    const changes: { name?: string; description?: string } = {};
    if (command.name !== undefined) changes.name = command.name;
    if (command.description !== undefined) changes.description = command.description;

    role.update(command.name, command.description);
    await this.roleRepository.update(role);
    await this.eventBus.publish(new RoleUpdatedEvent(role.id, changes));

    return RoleResponseDto.fromDomain(role);
  }
}
