import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogoutUserCommand } from '../logout-user.command';
import { SessionRepository } from '@domain/repositories/session.repository.interface';
import { RedisService } from '@core/redis.service';

export interface LogoutUserResponse {
  message: string;
}

@Injectable()
export class LogoutUserHandler {
  constructor(
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: LogoutUserCommand): Promise<LogoutUserResponse> {
    // 1. If allDevices = true
    if (command.allDevices) {
      await this.sessionRepository.deleteAllByUserId(command.userId);
      await this.redis.deletePattern(`session:${command.userId}:*`);
    } else {
      // 2. Single device logout
      if (command.token) {
        const session = await this.sessionRepository.findByToken(command.token);
        if (session) {
          await this.sessionRepository.deleteById(session.id);
          await this.redis.delete(`session:${command.userId}:${session.id}`);
        }
      }
    }

    // 3. Clear user cache
    await this.redis.delete(`user:${command.userId}`);

    // 4. Publish event
    this.eventEmitter.emit('user.logged-out', {
      userId: command.userId,
      allDevices: command.allDevices || false,
    });

    // 5. Return success
    return { message: 'Logged out successfully' };
  }
}
