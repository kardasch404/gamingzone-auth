import { Injectable } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import { generateId } from '../../../shared/utils/uuid.util';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponseDto> {
    // 1. Validate email doesn't exist
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    // 2. Create Email value object (validates format)
    const email = new Email(command.email);

    // 3. Create Password value object (validates strength & hashes)
    const password = await Password.fromPlainText(command.password);

    // 4. Create User entity
    const user = User.create(
      generateId(),
      email.getValue(),
      password.getValue(),
      command.firstName,
      command.lastName,
    );

    // 5. Save to database
    await this.userRepository.save(user);

    // 6. Assign default CUSTOMER role (async - don't block)
    this.assignDefaultRole(user.id).catch((err) => 
      console.error('Failed to assign default role:', err)
    );

    // 7. Publish event to Kafka
    await this.eventBus.publish(
      new UserRegisteredEvent(user.id, user.email),
    );

    // 8. Return DTO
    return UserResponseDto.fromDomain(user);
  }

  private async assignDefaultRole(userId: string): Promise<void> {
    const customerRole = await this.roleRepository.findByName('CUSTOMER');
    if (customerRole) {
      // TODO: Implement user-role assignment in repository
    }
  }
}
