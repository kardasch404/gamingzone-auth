import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityLogRepository } from '@domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '@domain/entities/activity-log.entity';
import { generateId } from '@common/utils/uuid.util';
import { LoggerService } from '@core/logger.service';

interface UserLoggedInEvent {
  userId: string;
  email: string;
  ipAddress?: string;
  timestamp: Date;
}

@Injectable()
export class UserLoggedInListener {
  constructor(
    @Inject('ActivityLogRepository')
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.logged-in')
  async handle(payload: UserLoggedInEvent) {
    const activityLog = new ActivityLog({
      id: generateId(),
      userId: payload.userId,
      action: 'login',
      ipAddress: payload.ipAddress || 'unknown',
      userAgent: 'unknown',
      metadata: { timestamp: payload.timestamp },
      createdAt: new Date(),
    });

    await this.activityLogRepository.create(activityLog);
    this.logger.log(`Activity logged for user ${payload.userId}`, {
      action: 'login',
    });
  }
}
