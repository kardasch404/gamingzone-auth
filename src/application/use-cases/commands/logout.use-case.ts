import { Injectable } from '@nestjs/common';
import { LogoutCommand } from './logout.command';
import { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token-repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(command.refreshToken);
  }
}
