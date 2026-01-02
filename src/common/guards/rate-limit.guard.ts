import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '@core/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const key = `rate-limit:login:${ip}`;

    const count = (await this.redis.get(key)) || '0';
    const attempts = parseInt(count, 10);

    if (attempts >= 5) {
      throw new HttpException('Too many login attempts', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.redis.incr(key);
    await this.redis.expire(key, 900);

    return true;
  }
}
