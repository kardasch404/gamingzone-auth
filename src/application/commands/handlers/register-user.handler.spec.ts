import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from '../register-user.command';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';
import { User } from '@domain/entities/user.entity';
import { Password } from '@domain/value-objects/password.vo';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let redisService: jest.Mocked<RedisService>;
  let loggerService: jest.Mocked<LoggerService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    } as any;

    loggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    } as any;

    handler = new RegisterUserHandler(userRepository, redisService, loggerService, eventEmitter);
  });

  describe('execute', () => {
    const command: RegisterUserCommand = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register user successfully', async () => {
      const mockUser = new User({
        id: '123',
        email: command.email,
        passwordHash: 'hashed',
        firstName: command.firstName,
        lastName: command.lastName,
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'default-role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await handler.execute(command);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('email-verification:'),
        expect.any(String),
        300,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('user.registered', expect.any(Object));
      expect(result.email).toBe(command.email);
      expect(result.emailVerified).toBe(false);
    });

    it('should throw ConflictException if email exists', async () => {
      const existingUser = new User({
        id: '123',
        email: command.email,
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(handler.execute(command)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password correctly', async () => {
      const mockUser = new User({
        id: '123',
        email: command.email,
        passwordHash: await Password.fromPlainText(command.password).then((p) => p.getValue()),
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      await handler.execute(command);

      const savedUser = userRepository.save.mock.calls[0][0];
      expect(savedUser.passwordHash).not.toBe(command.password);
      expect(await Password.compare(command.password, savedUser.passwordHash)).toBe(true);
    });

    it('should generate 6-digit verification code', async () => {
      const mockUser = new User({
        id: '123',
        email: command.email,
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      await handler.execute(command);

      const redisCall = redisService.set.mock.calls[0];
      const verificationCode = redisCall[1];
      expect(verificationCode).toMatch(/^\d{6}$/);
    });

    it('should store verification code in Redis with 5-minute TTL', async () => {
      const mockUser = new User({
        id: '123',
        email: command.email,
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      await handler.execute(command);

      expect(redisService.set).toHaveBeenCalledWith(
        'email-verification:123',
        expect.any(String),
        300,
      );
    });
  });
});
