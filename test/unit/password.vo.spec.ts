import { BadRequestException } from '@nestjs/common';
import { Password } from '../../src/domain/value-objects/password.vo';

describe('Password Value Object', () => {
  it('should create valid password', () => {
    const password = new Password('Test@1234');
    expect(password.getValue()).toBe('Test@1234');
  });

  it('should throw error for password less than 8 characters', () => {
    expect(() => new Password('Test@12')).toThrow(BadRequestException);
  });

  it('should throw error for password without uppercase', () => {
    expect(() => new Password('test@1234')).toThrow(BadRequestException);
  });

  it('should throw error for password without lowercase', () => {
    expect(() => new Password('TEST@1234')).toThrow(BadRequestException);
  });

  it('should throw error for password without number', () => {
    expect(() => new Password('Test@abcd')).toThrow(BadRequestException);
  });

  it('should throw error for password without special character', () => {
    expect(() => new Password('Test1234')).toThrow(BadRequestException);
  });

  it('should accept valid complex password', () => {
    const password = new Password('MyP@ssw0rd!');
    expect(password.getValue()).toBe('MyP@ssw0rd!');
  });
});
