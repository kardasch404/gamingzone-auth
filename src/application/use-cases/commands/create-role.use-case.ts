import { Injectable } from '@nestjs/common';
import { CreateRoleCommand } from './create-role.command';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { Role } from '../../../domain/entities/role.entity';
import { RoleCreatedEvent } from '../../../domain/events/role-created.event';
import { generateId } from '../../../shared/utils/uuid.util';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    const role = Role.create(
      generateId(),
      command.name,
      command.description,
      command.isSystem,
    );

    await this.roleRepository.save(role);
    await this.eventBus.publish(new RoleCreatedEvent(role.id, role.name, role.isSystem));

    return RoleResponseDto.fromDomain(role);
  }
}
