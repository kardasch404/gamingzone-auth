import { Injectable } from '@nestjs/common';
import { CreateRoleCommand } from './create-role.command';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { Role } from '../../../domain/entities/role.entity';
import { generateId } from '../../../shared/utils/uuid.util';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    const role = Role.create(
      generateId(),
      command.name,
      command.description,
      command.isSystem,
    );

    await this.roleRepository.save(role);

    return RoleResponseDto.fromDomain(role);
  }
}
