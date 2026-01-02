import { Injectable, UnauthorizedException, ForbiddenException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginUserCommand } from '../login-user.command';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { SessionRepository } from '@domain/repositories/session.repository.interface';
import { JwtAuthService } from '@infrastructure/auth/jwt.service';
import { RedisService } from '@core/redis.service';
import { Password } from '@domain/value-objects/password.vo';
import { Session } from '@domain/entities/session.entity';
import { generateId } from '@common/utils/uuid.util';

export interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roleId: string;
  };
}

@Injectable()
export class LoginUserHandler {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Account deactivated');
    }

    // 3. Verify password
    const isValid = await Password.compare(command.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Check email verification
    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email');
    }

    // 5. Generate tokens
    const accessToken = this.jwtAuthService.generateAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    });
    const refreshToken = this.jwtAuthService.generateRefreshToken({
      userId: user.id,
    });

    // 6. Create session
    const session = new Session({
      id: generateId(),
      userId: user.id,
      token: accessToken,
      refreshToken: refreshToken,
      ipAddress: command.ipAddress || 'unknown',
      userAgent: command.userAgent || 'unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
    await this.sessionRepository.create(session);

    // 7. Cache user in Redis
    const cacheKey = `user:${user.id}`;
    await this.redis.set(cacheKey, JSON.stringify(user.toJSON()), 3600);

    // 8. Update last login
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    // 9. Publish event
    this.eventEmitter.emit('user.logged-in', {
      userId: user.id,
      email: user.email,
      ipAddress: command.ipAddress,
      timestamp: new Date(),
    });

    // 10. Return response
    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
      },
    };
  }
}
