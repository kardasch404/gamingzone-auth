import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma.service';
import { SessionRepository } from '@domain/repositories/session.repository.interface';
import { Session } from '@domain/entities/session.entity';
import { PrismaSessionMapper } from '../mappers/session.mapper';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Session): Promise<Session> {
    const data = PrismaSessionMapper.toPrisma(session);
    const created = await this.prisma.session.create({ data });
    return PrismaSessionMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });
    return session ? PrismaSessionMapper.toDomain(session) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    });
    return sessions.map(PrismaSessionMapper.toDomain);
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
