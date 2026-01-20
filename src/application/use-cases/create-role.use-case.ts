import { Injectable, ConflictException } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleResponseDto } from '../dto/role-response.dto';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existingRole = await this.roleRepository.findByName(dto.name);
    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const role = await this.roleRepository.create({
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem || false,
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
    };
  }
}
