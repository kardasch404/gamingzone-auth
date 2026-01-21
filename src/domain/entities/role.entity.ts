export class Role {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public isSystem: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(id: string, name: string, description?: string, isSystem = false): Role {
    return new Role(id, name, description || null, isSystem, new Date(), new Date());
  }

  update(name?: string, description?: string): void {
    if (name !== undefined) this.name = name;
    if (description !== undefined) this.description = description;
    this.updatedAt = new Date();
  }

  canDelete(): boolean {
    return !this.isSystem;
  }
}
