import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtPayload } from '../../../domain/interfaces/token-service.interface';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { UserResponseDto } from '../../../application/dto/response/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    const userEntity = await this.userRepository.findById(user.sub);
    return UserResponseDto.fromDomain(userEntity);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { firstName?: string; lastName?: string },
  ): Promise<UserResponseDto> {
    const userEntity = await this.userRepository.findById(user.sub);
    userEntity.updateProfile(dto.firstName, dto.lastName);
    await this.userRepository.update(userEntity);
    return UserResponseDto.fromDomain(userEntity);
  }

  @Delete('me')
  async deleteProfile(@CurrentUser() user: JwtPayload): Promise<void> {
    const userEntity = await this.userRepository.findById(user.sub);
    userEntity.delete();
    await this.userRepository.update(userEntity);
  }
}
