import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RegisterUserUseCase } from '../use-cases/commands/register-user.use-case';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/role.repository';
import { EventBusService } from '../../infrastructure/messaging/kafka/event-bus.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    RegisterUserUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IEventBus',
      useClass: EventBusService,
    },
  ],
  exports: [RegisterUserUseCase],
})
export class AuthModule {}
