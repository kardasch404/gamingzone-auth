import { Test, TestingModule } from '@nestjs/testing';
import { CheckPermissionUseCase } from '../../src/application/use-cases/check-permission.use-case';
import { IPermissionEvaluator } from '../../src/application/ports/permission-evaluator.interface';

describe('CheckPermissionUseCase', () => {
  let useCase: CheckPermissionUseCase;

  const mockPermissionEvaluator = {
    hasPermission: jest.fn(),
    evaluateConditions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CheckPermissionUseCase,
          useFactory: (evaluator: IPermissionEvaluator) => new CheckPermissionUseCase(evaluator),
          inject: ['IPermissionEvaluator'],
        },
        { provide: 'IPermissionEvaluator', useValue: mockPermissionEvaluator },
      ],
    }).compile();

    useCase = module.get<CheckPermissionUseCase>(CheckPermissionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when user has permission', async () => {
    mockPermissionEvaluator.hasPermission.mockResolvedValue(true);

    const result = await useCase.execute('user1', 'orders', 'read');
    expect(result).toBe(true);
    expect(mockPermissionEvaluator.hasPermission).toHaveBeenCalledWith('user1', 'orders', 'read', undefined);
  });

  it('should return false when user does not have permission', async () => {
    mockPermissionEvaluator.hasPermission.mockResolvedValue(false);

    const result = await useCase.execute('user1', 'orders', 'delete');
    expect(result).toBe(false);
  });

  it('should pass context to evaluator', async () => {
    const context = { ownerId: 'user1', status: 'active' };
    mockPermissionEvaluator.hasPermission.mockResolvedValue(true);

    await useCase.execute('user1', 'orders', 'update', context);
    expect(mockPermissionEvaluator.hasPermission).toHaveBeenCalledWith('user1', 'orders', 'update', context);
  });
});
