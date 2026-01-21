export class RoleCreatedEvent {
  constructor(
    public readonly roleId: string,
    public readonly name: string,
    public readonly isSystem: boolean,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
