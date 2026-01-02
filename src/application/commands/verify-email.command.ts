import { IsUUID, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailCommand {
  @ApiProperty({ example: '019b7e90-fa25-9438-09b3-57d213c9b21e' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
