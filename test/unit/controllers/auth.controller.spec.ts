import { AuthController } from '../../../src/presentation/rest/controllers/auth.controller';
import { RegisterUserUseCase } from '../../../src/application/use-cases/commands/register-user.use-case';
import { LoginUseCase } from '../../../src/application/use-cases/commands/login.use-case';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../../src/application/use-cases/commands/logout.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  beforeEach(() => {
    registerUserUseCase = { execute: jest.fn() } as any;
    loginUseCase = { execute: jest.fn() } as any;
    refreshTokenUseCase = { execute: jest.fn() } as any;
    logoutUseCase = { execute: jest.fn() } as any;

    controller = new AuthController(
      registerUserUseCase,
      loginUseCase,
      refreshTokenUseCase,
      logoutUseCase,
    );
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@example.com', password: 'password123', firstName: 'John', lastName: 'Doe' };
      const result = { id: 'user-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' } as any;
      registerUserUseCase.execute.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(registerUserUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = { accessToken: 'token', refreshToken: 'refresh', expiresIn: 900 };
      loginUseCase.execute.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(loginUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const result = { accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 900 };
      refreshTokenUseCase.execute.mockResolvedValue(result);

      expect(await controller.refresh('old-refresh')).toEqual(result);
      expect(refreshTokenUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      await controller.logout('refresh-token');
      expect(logoutUseCase.execute).toHaveBeenCalled();
    });
  });
});
