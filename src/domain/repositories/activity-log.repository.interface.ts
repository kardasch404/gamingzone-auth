import { ActivityLog } from '../entities/activity-log.entity';

export interface ActivityLogRepository {
  create(activityLog: ActivityLog): Promise<ActivityLog>;
  findByUserId(userId: string, limit?: number): Promise<ActivityLog[]>;
}
