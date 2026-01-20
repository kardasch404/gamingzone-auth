import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  create(permission: Partial<Permission>): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByResource(resource: string): Promise<Permission[]>;
  update(id: string, permission: Partial<Permission>): Promise<Permission>;
  delete(id: string): Promise<void>;
}
