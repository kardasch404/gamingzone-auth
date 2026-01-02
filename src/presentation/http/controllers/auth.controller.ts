import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserCommand } from '@application/commands/register-user.command';
import { RegisterUserHandler } from '@application/commands/handlers/register-user.handler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUserHandler: RegisterUserHandler) {}

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
}
