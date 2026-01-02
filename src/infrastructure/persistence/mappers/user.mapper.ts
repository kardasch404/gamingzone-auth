import { User as PrismaUser } from '@prisma/client';
import { User } from '@domain/entities/user.entity';

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      firstName: prismaUser.firstName || undefined,
      lastName: prismaUser.lastName || undefined,
      phone: prismaUser.phone || undefined,
      isActive: prismaUser.isActive,
      emailVerified: prismaUser.emailVerified,
      phoneVerified: prismaUser.phoneVerified,
      roleId: prismaUser.roleId,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      lastLogin: prismaUser.lastLogin || undefined,
    });
  }

  static toPrisma(user: User) {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      phone: user.phone || null,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      roleId: user.roleId,
      lastLogin: user.lastLogin || null,
    };
  }
}
