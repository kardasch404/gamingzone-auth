import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  create(token: Partial<RefreshToken>): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
