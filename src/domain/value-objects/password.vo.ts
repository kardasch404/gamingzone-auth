import * as bcrypt from 'bcrypt';

export class Password {
  private readonly value: string;

  private constructor(hashedPassword: string) {
    this.value = hashedPassword;
  }

  static async create(plainPassword: string): Promise<Password> {
    this.validate(plainPassword);
    const hashed = await bcrypt.hash(plainPassword, 10);
    return new Password(hashed);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  private static validate(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.value);
  }

  getValue(): string {
    return this.value;
  }
}
