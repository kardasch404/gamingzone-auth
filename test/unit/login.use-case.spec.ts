import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../src/application/use-cases/login.use-case';
import { IUserRepository } from '../../src/domain/interfaces/user-repository.interface';
import { IRefreshTokenRepository } from '../../src/domain/interfaces/refresh-token-repository.interface';
import { IJwtTokenService } from '../../src/application/ports/jwt-token-service.interface';
import { LoginDto } from '../../src/application/dto/login.dto';
import { PasswordHasher } from '../../src/shared/utils/password-hasher.util';

jest.mock('../../src/shared/utils/password-hasher.util');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    findByUserId: jest.fn(),
    delete: jest.fn(),
    deleteByUserId: jest.fn(),
  };

  const mockJwtTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoginUseCase,
          useFactory: (userRepo: any, tokenRepo: any, jwtService: any) =>
            new LoginUseCase(userRepo, tokenRepo, jwtService),
          inject: ['IUserRepository', 'IRefreshTokenRepository', 'IJwtTokenService'],
        },
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'IRefreshTokenRepository', useValue: mockRefreshTokenRepository },
        { provide: 'IJwtTokenService', useValue: mockJwtTokenService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const dto: LoginDto = { email: 'test@test.com', password: 'Test@1234' };
    const user = {
      id: '1',
      email: dto.email,
      password: 'hashedPassword',
      firstname: 'John',
      lastname: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(user);
    (PasswordHasher.compare as jest.Mock).mockResolvedValue(true);
    mockJwtTokenService.generateAccessToken.mockReturnValue('access-token');
    mockJwtTokenService.generateRefreshToken.mockReturnValue('refresh-token');
    mockRefreshTokenRepository.create.mockResolvedValue({});

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.expiresIn).toBe(900);
    expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const dto: LoginDto = { email: 'notfound@test.com', password: 'Test@1234' };
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const dto: LoginDto = { email: 'test@test.com', password: 'WrongPass' };
    const user = { id: '1', email: dto.email, password: 'hashedPassword' };

    mockUserRepository.findByEmail.mockResolvedValue(user);
    (PasswordHasher.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });
});
