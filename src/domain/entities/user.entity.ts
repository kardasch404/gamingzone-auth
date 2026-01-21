export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public firstName: string | null,
    public lastName: string | null,
    public isActive: boolean,
    public status: UserStatus,
    public emailVerified: boolean,
    public lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    id: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): User {
    return new User(
      id,
      email,
      password,
      firstName || null,
      lastName || null,
      true,
      UserStatus.ACTIVE,
      false,
      null,
      new Date(),
      new Date(),
    );
  }

  activate(): void {
    this.isActive = true;
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.status = UserStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.isActive = false;
    this.status = UserStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  delete(): void {
    this.isActive = false;
    this.status = UserStatus.DELETED;
    this.updatedAt = new Date();
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  updateProfile(firstName?: string, lastName?: string): void {
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.status === UserStatus.DELETED;
  }

  isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  canLogin(): boolean {
    return this.isActive && this.status === UserStatus.ACTIVE;
  }
}
