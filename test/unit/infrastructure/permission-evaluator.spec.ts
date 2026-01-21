import { PermissionEvaluator } from '../../../src/infrastructure/authorization/permission-evaluator.service';
import { IPermissionRepository } from '../../../src/domain/interfaces/permission-repository.interface';
import { RedisService } from '../../../src/infrastructure/cache/redis/redis.service';
import { Permission } from '../../../src/domain/entities/permission.entity';

describe('PermissionEvaluator', () => {
  let evaluator: PermissionEvaluator;
  let permissionRepository: jest.Mocked<IPermissionRepository>;
  let redis: jest.Mocked<RedisService>;

  beforeEach(() => {
    permissionRepository = {
      findByUserId: jest.fn(),
    } as any;

    redis = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    } as any;

    evaluator = new PermissionEvaluator(permissionRepository, redis);
  });

  it('should grant permission without conditions', async () => {
    const permission = Permission.create('1', 'user', 'read');
    permissionRepository.findByUserId.mockResolvedValue([permission]);
    redis.get.mockResolvedValue(null);

    const result = await evaluator.hasPermission('user1', 'user', 'read');

    expect(result).toBe(true);
    expect(redis.set).toHaveBeenCalledWith(expect.any(String), true, 300);
  });

  it('should deny permission if not found', async () => {
    permissionRepository.findByUserId.mockResolvedValue([]);
    redis.get.mockResolvedValue(null);

    const result = await evaluator.hasPermission('user1', 'user', 'delete');

    expect(result).toBe(false);
  });

  it('should evaluate conditions', async () => {
    const permission = Permission.create('1', 'user', 'update', {
      field: 'userId',
      operator: 'eq',
      value: '@currentUser',
    });
    permissionRepository.findByUserId.mockResolvedValue([permission]);
    redis.get.mockResolvedValue(null);

    const result = await evaluator.hasPermission('user1', 'user', 'update', {
      userId: 'user1',
    });

    expect(result).toBe(true);
  });

  it('should use cached results', async () => {
    redis.get.mockResolvedValue(true);

    const result = await evaluator.hasPermission('user1', 'user', 'read');

    expect(result).toBe(true);
    expect(permissionRepository.findByUserId).not.toHaveBeenCalled();
  });
});
