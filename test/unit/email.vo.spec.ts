import { BadRequestException } from '@nestjs/common';
import { Email } from '../../src/domain/value-objects/email.vo';

describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const email = new Email('  test@example.com  ');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow(BadRequestException);
    expect(() => new Email('test@')).toThrow(BadRequestException);
    expect(() => new Email('@example.com')).toThrow(BadRequestException);
  });

  it('should compare emails correctly', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('TEST@EXAMPLE.COM');
    const email3 = new Email('other@example.com');
    
    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
