import { JwtAuthGuard } from '../../../src/presentation/guards/jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when user is not provided', () => {
    expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
  });

  it('should throw error when error is provided', () => {
    const error = new Error('Test error');
    expect(() => guard.handleRequest(error, null, null)).toThrow(error);
  });

  it('should return user when valid', () => {
    const user = { sub: 'user-1', email: 'test@example.com', roles: [], permissions: [] };
    const result = guard.handleRequest(null, user, null);
    expect(result).toEqual(user);
  });
});
