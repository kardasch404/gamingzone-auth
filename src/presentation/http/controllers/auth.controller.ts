import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserCommand } from '@application/commands/register-user.command';
import { RegisterUserHandler } from '@application/commands/handlers/register-user.handler';
import { VerifyEmailCommand } from '@application/commands/verify-email.command';
import { VerifyEmailHandler } from '@application/commands/handlers/verify-email.handler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
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
}
