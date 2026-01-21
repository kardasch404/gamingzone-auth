import { LogoutUseCase } from '../../../../src/application/use-cases/commands/logout.use-case';
import { LogoutCommand } from '../../../../src/application/use-cases/commands/logout.command';
import { IRefreshTokenRepository } from '../../../../src/domain/interfaces/refresh-token-repository.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
    refreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteByToken: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    useCase = new LogoutUseCase(refreshTokenRepository);
  });

  it('should logout successfully', async () => {
    const command = new LogoutCommand('refresh-token');

    await useCase.execute(command);

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('refresh-token');
  });

  it('should handle logout with non-existent token', async () => {
    refreshTokenRepository.deleteByToken.mockResolvedValue(undefined);

    const command = new LogoutCommand('non-existent-token');

    await expect(useCase.execute(command)).resolves.toBeUndefined();
  });
});
