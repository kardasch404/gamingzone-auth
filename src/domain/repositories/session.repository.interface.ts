import { Session } from '../entities/session.entity';

export interface SessionRepository {
  create(session: Session): Promise<Session>;
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  deleteById(id: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
  deleteExpiredSessions(): Promise<number>;
}
