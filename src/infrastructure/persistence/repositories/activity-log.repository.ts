import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma.service';
import { ActivityLogRepository } from '@domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '@domain/entities/activity-log.entity';
import { PrismaActivityLogMapper } from '../mappers/activity-log.mapper';

@Injectable()
export class PrismaActivityLogRepository implements ActivityLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(activityLog: ActivityLog): Promise<ActivityLog> {
    const data = PrismaActivityLogMapper.toPrisma(activityLog);
    const created = await this.prisma.activityLog.create({ data });
    return PrismaActivityLogMapper.toDomain(created);
  }

  async findByUserId(userId: string, limit = 50): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map(PrismaActivityLogMapper.toDomain);
  }
}
