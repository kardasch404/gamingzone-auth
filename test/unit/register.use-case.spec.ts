import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from '../../src/application/use-cases/register.use-case';
import { IUserRepository } from '../../src/domain/interfaces/user-repository.interface';
import { RegisterUserDto } from '../../src/application/dto/register-user.dto';
import { PasswordHasher } from '../../src/shared/utils/password-hasher.util';

jest.mock('../../src/shared/utils/password-hasher.util');

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: IUserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: 'IUserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get<IUserRepository>('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const dto: RegisterUserDto = {
      email: 'test@test.com',
      password: 'password123',
      firstname: 'John',
      lastname: 'Doe',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    (PasswordHasher.hash as jest.Mock).mockResolvedValue('hashedPassword');
    mockUserRepository.create.mockResolvedValue({
      id: '1',
      email: dto.email,
      password: 'hashedPassword',
      firstname: dto.firstname,
      lastname: dto.lastname,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.email).toBe(dto.email);
    expect(result.firstname).toBe(dto.firstname);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(PasswordHasher.hash).toHaveBeenCalledWith(dto.password);
  });

  it('should throw ConflictException if email already exists', async () => {
    const dto: RegisterUserDto = {
      email: 'existing@test.com',
      password: 'password123',
      firstname: 'John',
      lastname: 'Doe',
    };

    mockUserRepository.findByEmail.mockResolvedValue({ id: '1', email: dto.email });

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
