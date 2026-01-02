import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from '../email/email.service.interface';
import { UserRegisteredEvent } from './user-registered.event';
import { LoggerService } from '@core/logger.service';

@Injectable()
export class UserRegisteredListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern('user.registered')
  async handleUserRegistered(payload: UserRegisteredEvent): Promise<void> {
    const { userId, email, verificationCode } = payload;

    try {
      await this.emailService.sendVerificationEmail(email, verificationCode);
      this.logger.log(
        `Verification email sent to ${email} for user ${userId}`,
        'UserRegisteredListener',
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification email for user ${userId}`,
        error.stack,
        'UserRegisteredListener',
      );
    }
  }
}
