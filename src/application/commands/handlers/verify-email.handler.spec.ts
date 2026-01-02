import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VerifyEmailHandler } from './verify-email.handler';
import { VerifyEmailCommand } from '../verify-email.command';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';
import { User } from '@domain/entities/user.entity';

describe('VerifyEmailHandler', () => {
  let handler: VerifyEmailHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let redisService: jest.Mocked<RedisService>;
  let loggerService: jest.Mocked<LoggerService>;

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

    handler = new VerifyEmailHandler(userRepository, redisService, loggerService);
  });

  describe('execute', () => {
    const command: VerifyEmailCommand = {
      userId: '123',
      code: '123456',
    };

    it('should verify email successfully', async () => {
      const mockUser = new User({
        id: command.userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      redisService.get.mockResolvedValue(command.code);
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await handler.execute(command);

      expect(redisService.get).toHaveBeenCalledWith('email-verification:123');
      expect(userRepository.findById).toHaveBeenCalledWith(command.userId);
      expect(userRepository.update).toHaveBeenCalledWith(command.userId, { emailVerified: true });
      expect(redisService.delete).toHaveBeenCalledWith('email-verification:123');
      expect(result.message).toBe('Email verified successfully');
    });

    it('should throw BadRequestException if code is expired', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
      await expect(handler.execute(command)).rejects.toThrow('Code expired or invalid');
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if code is invalid', async () => {
      redisService.get.mockResolvedValue('654321');

      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
      await expect(handler.execute(command)).rejects.toThrow('Invalid code');
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      redisService.get.mockResolvedValue(command.code);
      userRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should delete verification code after successful verification', async () => {
      const mockUser = new User({
        id: command.userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      redisService.get.mockResolvedValue(command.code);
      userRepository.findById.mockResolvedValue(mockUser);

      await handler.execute(command);

      expect(redisService.delete).toHaveBeenCalledWith('email-verification:123');
    });

    it('should call verifyEmail method on user entity', async () => {
      const mockUser = new User({
        id: command.userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const verifyEmailSpy = jest.spyOn(mockUser, 'verifyEmail');

      redisService.get.mockResolvedValue(command.code);
      userRepository.findById.mockResolvedValue(mockUser);

      await handler.execute(command);

      expect(verifyEmailSpy).toHaveBeenCalled();
      expect(mockUser.emailVerified).toBe(true);
    });
  });
});
