import { UserController } from '../../../src/presentation/rest/controllers/user.controller';
import { IUserRepository } from '../../../src/domain/interfaces/user-repository.interface';
import { User, UserStatus } from '../../../src/domain/entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new UserController(userRepository);
  });

  const mockUser = new User(
    'user-1',
    'test@example.com',
    'hashed',
    'John',
    'Doe',
    true,
    UserStatus.ACTIVE,
    true,
    null,
    new Date(),
    new Date(),
  );

  describe('getProfile', () => {
    it('should return user profile', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      const jwtPayload = { sub: 'user-1', email: 'test@example.com', roles: [], permissions: [] };

      const result = await controller.getProfile(jwtPayload);

      expect(result.id).toBe('user-1');
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      const jwtPayload = { sub: 'user-1', email: 'test@example.com', roles: [], permissions: [] };

      await controller.updateProfile(jwtPayload, { firstName: 'Jane' });

      expect(userRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      const jwtPayload = { sub: 'user-1', email: 'test@example.com', roles: [], permissions: [] };

      await controller.deleteProfile(jwtPayload);

      expect(userRepository.update).toHaveBeenCalled();
    });
  });
});
