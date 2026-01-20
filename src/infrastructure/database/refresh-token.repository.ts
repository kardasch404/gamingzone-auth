import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { PrismaService } from './prisma.service';
import { UuidGenerator } from '../../shared/utils/uuid-generator.util';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(token: Partial<RefreshToken>): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        id: UuidGenerator.generate(),
        ...token,
      } as any,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({ where: { userId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
