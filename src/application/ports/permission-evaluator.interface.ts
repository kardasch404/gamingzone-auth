export interface IPermissionEvaluator {
  hasPermission(userId: string, resource: string, action: string, context?: any): Promise<boolean>;
  evaluateConditions(conditions: any, context: any): boolean;
}
