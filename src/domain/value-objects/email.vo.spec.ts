import { Email } from './email.vo';

describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow('Invalid email format');
  });

  it('should convert to lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should check equality', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });
});
