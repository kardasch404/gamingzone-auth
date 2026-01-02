import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'Logout from all devices',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allDevices?: boolean;
}
