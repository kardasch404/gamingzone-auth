export interface IRolePermissionRepository {
  assignPermissions(roleId: string, permissionIds: string[]): Promise<void>;
  removePermissions(roleId: string, permissionIds: string[]): Promise<void>;
}
