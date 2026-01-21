import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists' })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    const command = new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName);
    return this.registerUserUseCase.execute(command);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const command = new LoginCommand(dto.email, dto.password);
    return this.loginUseCase.execute(command);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    const command = new RefreshTokenCommand(refreshToken);
    return this.refreshTokenUseCase.execute(command);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    const command = new LogoutCommand(refreshToken);
    await this.logoutUseCase.execute(command);
  }
}
