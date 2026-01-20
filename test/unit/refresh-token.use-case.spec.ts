import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from '../../src/application/use-cases/refresh-token.use-case';
import { IJwtTokenService } from '../../src/application/ports/jwt-token-service.interface';
import { IRefreshTokenRepository } from '../../src/domain/interfaces/refresh-token-repository.interface';
import { IUserRepository } from '../../src/domain/interfaces/user-repository.interface';
import { RefreshTokenDto } from '../../src/application/dto/refresh-token.dto';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockJwtTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    findByUserId: jest.fn(),
    delete: jest.fn(),
    deleteByUserId: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RefreshTokenUseCase,
          useFactory: (jwtService: any, tokenRepo: any, userRepo: any) =>
            new RefreshTokenUseCase(jwtService, tokenRepo, userRepo),
          inject: ['IJwtTokenService', 'IRefreshTokenRepository', 'IUserRepository'],
        },
        { provide: 'IJwtTokenService', useValue: mockJwtTokenService },
        { provide: 'IRefreshTokenRepository', useValue: mockRefreshTokenRepository },
        { provide: 'IUserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    const dto: RefreshTokenDto = { refreshToken: 'valid-refresh-token' };
    const payload = { sub: 'user1' };
    const storedToken = {
      id: 'token1',
      userId: 'user1',
      token: dto.refreshToken,
      expiresAt: new Date(Date.now() + 1000000),
      createdAt: new Date(),
    };
    const user = {
      id: 'user1',
      email: 'test@test.com',
      firstname: 'John',
      lastname: 'Doe',
      password: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJwtTokenService.verifyRefreshToken.mockReturnValue(payload);
    mockRefreshTokenRepository.findByToken.mockResolvedValue(storedToken);
    mockUserRepository.findById.mockResolvedValue(user);
    mockJwtTokenService.generateAccessToken.mockReturnValue('new-access-token');
    mockJwtTokenService.generateRefreshToken.mockReturnValue('new-refresh-token');
    mockRefreshTokenRepository.delete.mockResolvedValue(undefined);
    mockRefreshTokenRepository.create.mockResolvedValue({});

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith('token1');
    expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const dto: RefreshTokenDto = { refreshToken: 'invalid-token' };
    mockJwtTokenService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is expired', async () => {
    const dto: RefreshTokenDto = { refreshToken: 'expired-token' };
    const payload = { sub: 'user1' };
    const storedToken = {
      id: 'token1',
      userId: 'user1',
      token: dto.refreshToken,
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    };

    mockJwtTokenService.verifyRefreshToken.mockReturnValue(payload);
    mockRefreshTokenRepository.findByToken.mockResolvedValue(storedToken);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });
});
