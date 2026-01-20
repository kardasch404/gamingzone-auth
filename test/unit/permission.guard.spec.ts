import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../../src/presentation/guards/permission.guard';
import { IPermissionEvaluator } from '../../src/application/ports/permission-evaluator.interface';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionEvaluator: IPermissionEvaluator;

  const mockPermissionEvaluator = {
    hasPermission: jest.fn(),
    evaluateConditions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PermissionGuard,
          useFactory: (reflector: Reflector, evaluator: IPermissionEvaluator) =>
            new PermissionGuard(reflector, evaluator),
          inject: [Reflector, 'IPermissionEvaluator'],
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: 'IPermissionEvaluator',
          useValue: mockPermissionEvaluator,
        },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    reflector = module.get<Reflector>(Reflector);
    permissionEvaluator = module.get<IPermissionEvaluator>('IPermissionEvaluator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access if no permission required', async () => {
    const context = createMockExecutionContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if user has permission', async () => {
    const context = createMockExecutionContext({ userId: 'user1' });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ resource: 'orders', action: 'read' });
    mockPermissionEvaluator.hasPermission.mockResolvedValue(true);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPermissionEvaluator.hasPermission).toHaveBeenCalledWith('user1', 'orders', 'read', {});
  });

  it('should deny access if user lacks permission', async () => {
    const context = createMockExecutionContext({ userId: 'user1' });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ resource: 'orders', action: 'delete' });
    mockPermissionEvaluator.hasPermission.mockResolvedValue(false);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should deny access if user not authenticated', async () => {
    const context = createMockExecutionContext(null);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ resource: 'orders', action: 'read' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});

function createMockExecutionContext(user: any = {}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, body: {} }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;
}
