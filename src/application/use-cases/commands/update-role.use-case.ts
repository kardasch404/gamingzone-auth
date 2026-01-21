import { Injectable } from '@nestjs/common';
import { UpdateRoleCommand } from './update-role.command';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../domain/exceptions/system-role.exception';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    if (role.isSystem) {
      throw new SystemRoleException();
    }

    role.update(command.name, command.description);
    await this.roleRepository.update(role);

    return RoleResponseDto.fromDomain(role);
  }
}
