import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/commands/register-user.use-case';
import { LoginUseCase } from '../../../application/use-cases/commands/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/commands/logout.use-case';
import { RegisterUserCommand } from '../../../application/use-cases/commands/register-user.command';
import { LoginCommand } from '../../../application/use-cases/commands/login.command';
import { RefreshTokenCommand } from '../../../application/use-cases/commands/refresh-token.command';
import { LogoutCommand } from '../../../application/use-cases/commands/logout.command';
import { RegisterUserDto } from '../../../application/dto/request/register-user.dto';
import { LoginDto } from '../../../application/dto/request/login.dto';
import { UserResponseDto } from '../../../application/dto/response/user-response.dto';
import { AuthResponseDto } from '../../../application/dto/response/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    const command = new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName);
    return this.registerUserUseCase.execute(command);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const command = new LoginCommand(dto.email, dto.password);
    return this.loginUseCase.execute(command);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    const command = new RefreshTokenCommand(refreshToken);
    return this.refreshTokenUseCase.execute(command);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    const command = new LogoutCommand(refreshToken);
    await this.logoutUseCase.execute(command);
  }
}
