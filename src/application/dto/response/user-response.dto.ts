import { User, UserStatus } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.status = user.status;
    dto.emailVerified = user.emailVerified;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
