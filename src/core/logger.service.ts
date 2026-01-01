import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';

    this.logger = winston.createLogger({
      level: isDev ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: isDev
            ? winston.format.combine(winston.format.colorize(), winston.format.simple())
            : winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/app.log',
        }),
      ],
    });
  }

  private redactSensitive(data: any): any {
    if (!data) return data;
    const sensitive = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
    const redacted = { ...data };
    sensitive.forEach((key) => {
      if (redacted[key]) redacted[key] = '[REDACTED]';
    });
    return redacted;
  }

  log(message: string, meta?: any) {
    this.logger.info(message, this.redactSensitive(meta));
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...this.redactSensitive(meta) });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, this.redactSensitive(meta));
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, this.redactSensitive(meta));
  }
}
