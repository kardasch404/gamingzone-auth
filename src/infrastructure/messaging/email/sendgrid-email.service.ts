import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { EmailService } from './email.service.interface';
import { LoggerService } from '@core/logger.service';

@Injectable()
export class SendGridEmailService implements EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p style="font-size: 16px; color: #555;">Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${code}</strong>
        </div>
        <p style="font-size: 14px; color: #777;">This code expires in 5 minutes.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@gamingzone.com'),
        subject: 'Verify your email address',
        html: template,
      });
      this.logger.log(`Verification email sent to ${to}`, 'SendGridEmailService');
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${to}`,
        error.stack,
        'SendGridEmailService',
      );
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to GamingZone!</h1>
        <p style="font-size: 16px; color: #555;">Hi ${name},</p>
        <p style="font-size: 16px; color: #555;">Thank you for joining GamingZone. We're excited to have you on board!</p>
        <p style="font-size: 14px; color: #777;">Start exploring and enjoy your gaming experience.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@gamingzone.com'),
        subject: 'Welcome to GamingZone',
        html: template,
      });
      this.logger.log(`Welcome email sent to ${to}`, 'SendGridEmailService');
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${to}`,
        error.stack,
        'SendGridEmailService',
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const template = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p style="font-size: 16px; color: #555;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #777;">This link expires in 1 hour.</p>
        <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@gamingzone.com'),
        subject: 'Reset your password',
        html: template,
      });
      this.logger.log(`Password reset email sent to ${to}`, 'SendGridEmailService');
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}`,
        error.stack,
        'SendGridEmailService',
      );
      throw error;
    }
  }
}
