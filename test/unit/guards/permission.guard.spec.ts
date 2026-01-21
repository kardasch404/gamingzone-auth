import { PermissionGuard } from '../../../src/presentation/guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionEvaluator } from '../../../src/infrastructure/authorization/permission-evaluator.service';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;
  let permissionEvaluator: jest.Mocked<PermissionEvaluator>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    permissionEvaluator = {
      hasPermission: jest.fn(),
    } as any;

    guard = new PermissionGuard(reflector, permissionEvaluator);
  });

  const createMockContext = (user?: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user, body: {} }),
    }),
    getHandler: jest.fn(),
  } as any);

  it('should allow access when no permission required', async () => {
    reflector.get.mockReturnValue(null);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user not authenticated', async () => {
    reflector.get.mockReturnValue({ resource: 'product', action: 'create' });
    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access when user has permission', async () => {
    reflector.get.mockReturnValue({ resource: 'product', action: 'create' });
    const context = createMockContext({ sub: 'user-1' });
    permissionEvaluator.hasPermission.mockResolvedValue(true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(permissionEvaluator.hasPermission).toHaveBeenCalledWith('user-1', 'product', 'create', {});
  });

  it('should throw ForbiddenException when user lacks permission', async () => {
    reflector.get.mockReturnValue({ resource: 'product', action: 'delete' });
    const context = createMockContext({ sub: 'user-1' });
    permissionEvaluator.hasPermission.mockResolvedValue(false);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
