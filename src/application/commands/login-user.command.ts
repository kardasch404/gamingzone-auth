import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginUserCommand {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
