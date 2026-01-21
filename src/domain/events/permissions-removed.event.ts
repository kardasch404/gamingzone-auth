export class PermissionsRemovedEvent {
  constructor(
    public readonly roleId: string,
    public readonly permissionIds: string[],
    public readonly occurredAt: Date = new Date(),
  ) {}
}
