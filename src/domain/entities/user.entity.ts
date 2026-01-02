import { Password } from '../value-objects/password.vo';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get phoneVerified(): boolean {
    return this.props.phoneVerified;
  }

  get roleId(): string {
    return this.props.roleId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  verifyEmail(): void {
    this.props.emailVerified = true;
    this.props.updatedAt = new Date();
  }

  verifyPhone(): void {
    this.props.phoneVerified = true;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateProfile(data: { firstName?: string; lastName?: string; phone?: string }): void {
    if (data.firstName) this.props.firstName = data.firstName;
    if (data.lastName) this.props.lastName = data.lastName;
    if (data.phone) this.props.phone = data.phone;
    this.props.updatedAt = new Date();
  }

  updateLastLogin(): void {
    this.props.lastLogin = new Date();
    this.props.updatedAt = new Date();
  }

  isEmailVerified(): boolean {
    return this.props.emailVerified;
  }

  isPhoneVerified(): boolean {
    return this.props.phoneVerified;
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return Password.compare(plainPassword, this.props.passwordHash);
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
