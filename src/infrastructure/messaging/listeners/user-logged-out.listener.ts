import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityLogRepository } from '@domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '@domain/entities/activity-log.entity';
import { generateId } from '@common/utils/uuid.util';
import { LoggerService } from '@core/logger.service';

interface UserLoggedOutEvent {
  userId: string;
  allDevices: boolean;
}

@Injectable()
export class UserLoggedOutListener {
  constructor(
    @Inject('ActivityLogRepository')
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.logged-out')
  async handle(payload: UserLoggedOutEvent) {
    const activityLog = new ActivityLog({
      id: generateId(),
      userId: payload.userId,
      action: 'logout',
      ipAddress: 'unknown',
      userAgent: 'unknown',
      metadata: { allDevices: payload.allDevices },
      createdAt: new Date(),
    });

    await this.activityLogRepository.create(activityLog);
    this.logger.log(`Activity logged for user ${payload.userId}`, {
      action: 'logout',
      allDevices: payload.allDevices,
    });
  }
}
