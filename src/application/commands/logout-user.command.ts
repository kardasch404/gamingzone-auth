import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';

export class LogoutUserCommand {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsBoolean()
  @IsOptional()
  allDevices?: boolean;
}
