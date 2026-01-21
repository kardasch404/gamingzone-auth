import { User, UserStatus } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: any): User {
    return new User(
      raw.id,
      raw.email,
      raw.password,
      raw.firstName,
      raw.lastName,
      raw.isActive,
      raw.status as UserStatus,
      raw.emailVerified,
      raw.lastLoginAt,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
    };
  }
}
