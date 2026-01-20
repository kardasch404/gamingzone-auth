export class ConditionEvaluator {
  static evaluate(conditions: any, context: any): boolean {
    if (!conditions || typeof conditions !== 'object') return true;
    if (!context) return false;

    return Object.entries(conditions).every(([key, value]) => {
      switch (key) {
        case 'userId':
          return context.userId === value;
        case 'ownerId':
          return context.ownerId === value;
        case 'status':
          return context.status === value;
        case 'minAmount':
          return context.amount >= value;
        case 'maxAmount':
          return context.amount <= value;
        case 'role':
          return context.role === value;
        case 'department':
          return context.department === value;
        default:
          return context[key] === value;
      }
    });
  }
}
