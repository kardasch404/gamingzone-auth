export interface IRefreshTokenRepository {
  save(userId: string, token: string, expiresAt: Date): Promise<void>;
  findByToken(token: string): Promise<{ userId: string; expiresAt: Date } | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
