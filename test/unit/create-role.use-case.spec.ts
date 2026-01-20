import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateRoleUseCase } from '../../src/application/use-cases/create-role.use-case';
import { IRoleRepository } from '../../src/domain/interfaces/role-repository.interface';
import { CreateRoleDto } from '../../src/application/dto/create-role.dto';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let roleRepository: IRoleRepository;

  const mockRoleRepository = {
    create: jest.fn(),
    findByName: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignPermission: jest.fn(),
    removePermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateRoleUseCase,
          useFactory: (repo: IRoleRepository) => new CreateRoleUseCase(repo),
          inject: ['IRoleRepository'],
        },
        { provide: 'IRoleRepository', useValue: mockRoleRepository },
      ],
    }).compile();

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    roleRepository = module.get<IRoleRepository>('IRoleRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new role successfully', async () => {
    const dto: CreateRoleDto = {
      name: 'admin',
      description: 'Administrator role',
      isSystem: true,
    };

    mockRoleRepository.findByName.mockResolvedValue(null);
    mockRoleRepository.create.mockResolvedValue({
      id: '1',
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.name).toBe(dto.name);
    expect(result.isSystem).toBe(true);
    expect(mockRoleRepository.findByName).toHaveBeenCalledWith(dto.name);
    expect(mockRoleRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if role name already exists', async () => {
    const dto: CreateRoleDto = {
      name: 'admin',
      description: 'Administrator role',
    };

    mockRoleRepository.findByName.mockResolvedValue({ id: '1', name: 'admin' });

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRoleRepository.findByName).toHaveBeenCalledWith(dto.name);
    expect(mockRoleRepository.create).not.toHaveBeenCalled();
  });

  it('should set isSystem to false by default', async () => {
    const dto: CreateRoleDto = {
      name: 'user',
      description: 'User role',
    };

    mockRoleRepository.findByName.mockResolvedValue(null);
    mockRoleRepository.create.mockResolvedValue({
      id: '2',
      name: dto.name,
      description: dto.description,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.isSystem).toBe(false);
  });
});
