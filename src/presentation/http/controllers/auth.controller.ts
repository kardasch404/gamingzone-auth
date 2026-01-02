import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { RegisterUserCommand } from '@application/commands/register-user.command';
import { RegisterUserHandler } from '@application/commands/handlers/register-user.handler';
import { VerifyEmailCommand } from '@application/commands/verify-email.command';
import { VerifyEmailHandler } from '@application/commands/handlers/verify-email.handler';
import { LoginUserCommand } from '@application/commands/login-user.command';
import { LoginUserHandler } from '@application/commands/handlers/login-user.handler';
import { RefreshTokenCommand } from '@application/commands/refresh-token.command';
import { RefreshTokenHandler } from '@application/commands/handlers/refresh-token.handler';
import { LogoutUserCommand } from '@application/commands/logout-user.command';
import { LogoutUserHandler } from '@application/commands/handlers/logout-user.handler';
import { RateLimitGuard } from '@common/guards/rate-limit.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@domain/entities/user.entity';
import { LogoutDto } from '../dto/logout.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
    private readonly loginUserHandler: LoginUserHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutUserHandler: LogoutUserHandler,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        id: '01234567-89ab-cdef-0123-456789abcdef',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() command: RegisterUserCommand) {
    return await this.registerUserHandler.execute(command);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      example: {
        message: 'Email verified successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Code expired or invalid' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Body() command: VerifyEmailCommand) {
    return await this.verifyEmailHandler.execute(command);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
        user: {
          id: '01234567-89ab-cdef-0123-456789abcdef',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          roleId: 'role-id',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account deactivated or email not verified' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(@Body() dto: LoginUserCommand, @Req() req: Request) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    dto.ipAddress = ipAddress;
    dto.userAgent = userAgent;
    return await this.loginUserHandler.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() dto: RefreshTokenCommand) {
    return await this.refreshTokenHandler.execute(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: User,
    @Body() dto: LogoutDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const command = new LogoutUserCommand();
    command.userId = user.id;
    command.token = token;
    command.allDevices = dto.allDevices;
    return await this.logoutUserHandler.execute(command);
  }
}
