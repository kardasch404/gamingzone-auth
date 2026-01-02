import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterUserCommand } from '../register-user.command';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';
import { Email } from '@domain/value-objects/email.vo';
import { Password } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user.entity';
import { generateId } from '@common/utils/uuid.util';
import { UserRegisteredEvent } from '@infrastructure/messaging/events/user-registered.event';

export interface RegisterUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

@Injectable()
export class RegisterUserHandler {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    // 1. Check if email already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Create Email value object
    const email = new Email(command.email);

    // 3. Hash password
    const passwordHash = await Password.fromPlainText(command.password);

    // 4. Generate UUID v7
    const userId = generateId();

    // 5. Get default role (assuming 'user' role exists)
    const defaultRoleId = 'default-role-id'; // TODO: Get from RoleRepository

    // 6. Create User entity
    const user = new User({
      id: userId,
      email: email.getValue(),
      passwordHash: passwordHash.getValue(),
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      roleId: defaultRoleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. Save to database
    const savedUser = await this.userRepository.save(user);

    // 8. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 9. Store in Redis with 5-minute TTL
    const redisKey = `email-verification:${savedUser.id}`;
    await this.redis.set(redisKey, verificationCode, 300);

    // 10. Emit user.registered event
    const event = new UserRegisteredEvent();
    event.userId = savedUser.id;
    event.email = savedUser.email;
    event.verificationCode = verificationCode;
    this.eventEmitter.emit('user.registered', event);

    this.logger.log('User registered event emitted', {
      userId: savedUser.id,
      email: savedUser.email,
    });

    // 11. Return response (without sensitive data)
    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      emailVerified: savedUser.emailVerified,
    };
  }
}
