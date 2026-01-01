import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '@core/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message,
      error: exception instanceof HttpException ? exception.name : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(message, exception instanceof Error ? exception.stack : '', {
      statusCode: status,
      path: request.url,
      method: request.method,
      userId: request.user?.id,
    });

    response.status(status).json(errorResponse);
  }
}
