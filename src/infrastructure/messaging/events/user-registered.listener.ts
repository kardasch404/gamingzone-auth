import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { EmailService } from '../email/email.service.interface';
import { UserRegisteredEvent } from './user-registered.event';
import { LoggerService } from '@core/logger.service';

@Injectable()
export class UserRegisteredListener {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.registered')
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
        (error as Error).stack,
        'UserRegisteredListener',
      );
    }
  }
}
