import { Permission } from '../../../domain/entities/permission.entity';

export class PermissionMapper {
  static toDomain(raw: any): Permission {
    return new Permission(
      raw.id,
      raw.resource,
      raw.action,
      raw.conditions,
      raw.description,
      raw.createdAt,
    );
  }

  static toPersistence(permission: Permission): any {
    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      conditions: permission.conditions,
      description: permission.description,
    };
  }
}
