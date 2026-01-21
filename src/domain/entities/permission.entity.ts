export class Permission {
  constructor(
    public readonly id: string,
    public resource: string,
    public action: string,
    public conditions: Record<string, any> | null,
    public description: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(
    id: string,
    resource: string,
    action: string,
    conditions?: Record<string, any>,
    description?: string,
  ): Permission {
    return new Permission(id, resource, action, conditions || null, description || null, new Date());
  }

  matches(resource: string, action: string): boolean {
    return this.resource === resource && this.action === action;
  }

  hasConditions(): boolean {
    return this.conditions !== null && Object.keys(this.conditions).length > 0;
  }
}
