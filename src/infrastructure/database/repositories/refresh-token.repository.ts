import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findByToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });
    return record;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
