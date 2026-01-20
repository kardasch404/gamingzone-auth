import { Injectable } from '@nestjs/common';
import { IPermissionEvaluator } from '../ports/permission-evaluator.interface';

@Injectable()
export class CheckPermissionUseCase {
  constructor(private readonly permissionEvaluator: IPermissionEvaluator) {}

  async execute(userId: string, resource: string, action: string, context?: any): Promise<boolean> {
    return this.permissionEvaluator.hasPermission(userId, resource, action, context);
  }
}
