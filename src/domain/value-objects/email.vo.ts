import { BadRequestException } from '@nestjs/common';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    const trimmedEmail = email.trim();
    if (!this.isValid(trimmedEmail)) {
      throw new BadRequestException('Invalid email format');
    }
    this.value = trimmedEmail.toLowerCase();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
