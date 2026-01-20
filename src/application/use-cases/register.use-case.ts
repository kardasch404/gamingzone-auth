import { Injectable, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PasswordHasher } from '../../shared/utils/password-hasher.util';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await PasswordHasher.hash(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstname: dto.firstname,
      lastname: dto.lastname,
    });

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
    };
  }
}
