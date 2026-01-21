import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { RegisterUserUseCase } from '../../../application/use-cases/commands/register-user.use-case';
import { LoginUseCase } from '../../../application/use-cases/commands/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/commands/logout.use-case';
import { RegisterUserCommand } from '../../../application/use-cases/commands/register-user.command';
import { LoginCommand } from '../../../application/use-cases/commands/login.command';
import { RefreshTokenCommand } from '../../../application/use-cases/commands/refresh-token.command';
import { LogoutCommand } from '../../../application/use-cases/commands/logout.command';
import { AuthPayloadType } from '../../../application/dto/graphql/auth-payload.type';
import { RegisterInput, LoginInput } from '../../../application/dto/graphql/auth.input';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly userRepository: IUserRepository,
  ) {}

  @Mutation(() => AuthPayloadType)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayloadType> {
    const command = new RegisterUserCommand(input.email, input.password, input.firstName, input.lastName);
    const userDto = await this.registerUserUseCase.execute(command);
    
    const loginCommand = new LoginCommand(input.email, input.password);
    const authResponse = await this.loginUseCase.execute(loginCommand);
    
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: userDto as any,
    };
  }

  @Mutation(() => AuthPayloadType)
  async login(@Args('input') input: LoginInput): Promise<AuthPayloadType> {
    const command = new LoginCommand(input.email, input.password);
    const authResponse = await this.loginUseCase.execute(command);
    
    const user = await this.userRepository.findByEmail(input.email);
    
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    };
  }

  @Mutation(() => AuthPayloadType)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<AuthPayloadType> {
    const command = new RefreshTokenCommand(refreshToken);
    const authResponse = await this.refreshTokenUseCase.execute(command);
    
    const tokenData = await this.userRepository.findById('user-id');
    
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: tokenData as any,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Args('refreshToken') refreshToken: string): Promise<boolean> {
    const command = new LogoutCommand(refreshToken);
    await this.logoutUseCase.execute(command);
    return true;
  }
}
