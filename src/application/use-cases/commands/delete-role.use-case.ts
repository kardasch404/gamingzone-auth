import { Injectable } from '@nestjs/common';
import { DeleteRoleCommand } from './delete-role.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { RoleNotFoundException } from '../../../domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../domain/exceptions/system-role.exception';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new RoleNotFoundException(command.roleId);
    }

    if (!role.canDelete()) {
      throw new SystemRoleException();
    }

    await this.roleRepository.delete(command.roleId);
  }
}
