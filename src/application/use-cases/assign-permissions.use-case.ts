import { Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { IPermissionRepository } from '../../domain/interfaces/permission-repository.interface';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';

@Injectable()
export class AssignPermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(dto: AssignPermissionsDto): Promise<void> {
    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    for (const permissionId of dto.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw new NotFoundException(`Permission ${permissionId} not found`);
      }
      await this.roleRepository.assignPermission(dto.roleId, permissionId);
    }
  }
}
