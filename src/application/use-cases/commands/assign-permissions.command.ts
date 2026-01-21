export class AssignPermissionsCommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionIds: string[],
  ) {}
}
