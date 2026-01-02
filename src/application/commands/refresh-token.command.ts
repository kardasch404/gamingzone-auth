import { IsString } from 'class-validator';

export class RefreshTokenCommand {
  @IsString()
  refreshToken!: string;
}
