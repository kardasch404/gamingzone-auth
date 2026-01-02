import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { VerifyEmailCommand } from '../verify-email.command';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';

export interface VerifyEmailResponse {
  message: string;
}

@Injectable()
export class VerifyEmailHandler {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResponse> {
    // 1. Get stored code from Redis
    const redisKey = `email-verification:${command.userId}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode) {
      throw new BadRequestException('Code expired or invalid');
    }

    // 2. Compare codes
    if (storedCode !== command.code) {
      throw new BadRequestException('Invalid code');
    }

    // 3. Get user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 4. Verify email
    user.verifyEmail();
    await this.userRepository.update(user.id, { emailVerified: true });

    // 5. Delete code from Redis
    await this.redis.delete(redisKey);

    this.logger.log(`Email verified for user ${user.id}`, 'VerifyEmailHandler');

    // 6. Return success
    return { message: 'Email verified successfully' };
  }
}
