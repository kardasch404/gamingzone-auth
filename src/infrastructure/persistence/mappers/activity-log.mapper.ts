import { ActivityLog as PrismaActivityLog } from '@prisma/client';
import { ActivityLog, ActivityLogProps } from '@domain/entities/activity-log.entity';

export class PrismaActivityLogMapper {
  static toDomain(prismaActivityLog: PrismaActivityLog): ActivityLog {
    const props: ActivityLogProps = {
      id: prismaActivityLog.id,
      userId: prismaActivityLog.userId,
      action: prismaActivityLog.action,
      resource: prismaActivityLog.resource || undefined,
      metadata: prismaActivityLog.metadata as Record<string, any> | undefined,
      ipAddress: prismaActivityLog.ipAddress,
      userAgent: prismaActivityLog.userAgent,
      createdAt: prismaActivityLog.createdAt,
    };
    return new ActivityLog(props);
  }

  static toPrisma(activityLog: ActivityLog) {
    return {
      id: activityLog.id,
      userId: activityLog.userId,
      action: activityLog.action,
      resource: activityLog.resource || null,
      metadata: activityLog.metadata || null,
      ipAddress: activityLog.ipAddress,
      userAgent: activityLog.userAgent,
      createdAt: activityLog.createdAt,
    };
  }
}
