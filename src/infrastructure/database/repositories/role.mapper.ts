import { Role } from '../../../domain/entities/role.entity';

export class RoleMapper {
  static toDomain(raw: any): Role {
    return new Role(
      raw.id,
      raw.name,
      raw.description,
      raw.isSystem,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(role: Role): any {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      updatedAt: role.updatedAt,
    };
  }
}
 return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      updatedAt: role.updatedAt,
    };
  }