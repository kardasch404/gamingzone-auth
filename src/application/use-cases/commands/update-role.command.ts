export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly name?: string,
    public readonly description?: string,
  ) {}
}
