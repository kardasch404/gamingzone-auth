import { RolesGuard } from '../../../src/presentation/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
  } as any);

  it('should allow access when no roles required', () => {
    reflector.get.mockReturnValue(null);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when roles array is empty', () => {
    reflector.get.mockReturnValue([]);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user not authenticated', () => {
    reflector.get.mockReturnValue(['ADMIN']);
    const context = createMockContext();

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no roles', () => {
    reflector.get.mockReturnValue(['ADMIN']);
    const context = createMockContext({ sub: 'user-1' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has required role', () => {
    reflector.get.mockReturnValue(['ADMIN']);
    const context = createMockContext({ sub: 'user-1', roles: ['ADMIN', 'USER'] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has one of multiple required roles', () => {
    reflector.get.mockReturnValue(['ADMIN', 'MODERATOR']);
    const context = createMockContext({ sub: 'user-1', roles: ['USER', 'MODERATOR'] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user lacks all required roles', () => {
    reflector.get.mockReturnValue(['ADMIN', 'MODERATOR']);
    const context = createMockContext({ sub: 'user-1', roles: ['USER', 'GUEST'] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
