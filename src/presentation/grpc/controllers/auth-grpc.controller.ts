import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ITokenService } from '../../../domain/interfaces/token-service.interface';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { PermissionEvaluator } from '../../authorization/permission-evaluator.service';

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  roles: string[];
}

interface GetUserByIdRequest {
  userId: string;
}

interface UserResponse {
  id: string;
  email: string;
  status: string;
  roles: string[];
}

interface CheckPermissionRequest {
  userId: string;
  resource: string;
  action: string;
  context: string;
}

interface CheckPermissionResponse {
  allowed: boolean;
  reason: string;
}

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly permissionEvaluator: PermissionEvaluator,
  ) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const payload = this.tokenService.verifyAccessToken(data.token);
      return {
        valid: true,
        userId: payload.sub,
        roles: payload.roles,
      };
    } catch (error) {
      return {
        valid: false,
        userId: '',
        roles: [],
      };
    }
  }

  @GrpcMethod('AuthService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.userRepository.findById(data.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: [],
    };
  }

  @GrpcMethod('AuthService', 'GetUserPermissions')
  async getUserPermissions(data: { userId: string }) {
    const permissions = await this.permissionRepository.findByUserId(data.userId);
    
    return {
      permissions: permissions.map(p => ({
        resource: p.resource,
        action: p.action,
        conditions: JSON.stringify(p.conditions || {}),
      })),
    };
  }

  @GrpcMethod('AuthService', 'CheckPermission')
  async checkPermission(data: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    try {
      const context = data.context ? JSON.parse(data.context) : {};
      const allowed = await this.permissionEvaluator.hasPermission(
        data.userId,
        data.resource,
        data.action,
        context,
      );

      return {
        allowed,
        reason: allowed ? 'Permission granted' : 'Permission denied',
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error.message,
      };
    }
  }

  @GrpcMethod('AuthService', 'HealthCheck')
  async healthCheck(): Promise<{ status: string }> {
    return { status: 'OK' };
  }
}
