export class RoleDeletedEvent {
  constructor(
    public readonly roleId: string,
    public readonly name: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
