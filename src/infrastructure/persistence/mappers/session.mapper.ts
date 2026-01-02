import { Session as PrismaSession } from '@prisma/client';
import { Session, SessionProps } from '@domain/entities/session.entity';

export class PrismaSessionMapper {
  static toDomain(prismaSession: PrismaSession): Session {
    const props: SessionProps = {
      id: prismaSession.id,
      userId: prismaSession.userId,
      token: prismaSession.token,
      refreshToken: prismaSession.refreshToken,
      ipAddress: prismaSession.ipAddress,
      userAgent: prismaSession.userAgent,
      expiresAt: prismaSession.expiresAt,
      createdAt: prismaSession.createdAt,
    };
    return new Session(props);
  }

  static toPrisma(session: Session) {
    return {
      id: session.id,
      userId: session.userId,
      token: session.token,
      refreshToken: session.refreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    };
  }
}
