export class RoleUpdatedEvent {
  constructor(
    public readonly roleId: string,
    public readonly changes: { name?: string; description?: string },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
