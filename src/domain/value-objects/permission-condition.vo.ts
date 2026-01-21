export enum ConditionOperator {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
}

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export class PermissionCondition {
  private readonly rules: ConditionRule[];

  constructor(conditions: Record<string, any> | null) {
    this.rules = this.parseConditions(conditions);
  }

  private parseConditions(conditions: Record<string, any> | null): ConditionRule[] {
    if (!conditions) return [];
    
    return Object.entries(conditions).map(([field, config]) => ({
      field,
      operator: config.operator as ConditionOperator,
      value: config.value,
    }));
  }

  evaluate(context: Record<string, any>): boolean {
    if (this.rules.length === 0) return true;

    return this.rules.every((rule) => this.evaluateRule(rule, context));
  }

  private evaluateRule(rule: ConditionRule, context: Record<string, any>): boolean {
    const contextValue = context[rule.field];
    const ruleValue = this.resolveValue(rule.value, context);

    switch (rule.operator) {
      case ConditionOperator.EQ:
        return contextValue === ruleValue;
      case ConditionOperator.NE:
        return contextValue !== ruleValue;
      case ConditionOperator.GT:
        return contextValue > ruleValue;
      case ConditionOperator.LT:
        return contextValue < ruleValue;
      case ConditionOperator.GTE:
        return contextValue >= ruleValue;
      case ConditionOperator.LTE:
        return contextValue <= ruleValue;
      case ConditionOperator.IN:
        return Array.isArray(ruleValue) && ruleValue.includes(contextValue);
      case ConditionOperator.NOT_IN:
        return Array.isArray(ruleValue) && !ruleValue.includes(contextValue);
      case ConditionOperator.CONTAINS:
        return String(contextValue).includes(String(ruleValue));
      default:
        return false;
    }
  }

  private resolveValue(value: any, context: Record<string, any>): any {
    if (typeof value === 'string' && value.startsWith('@')) {
      const key = value.substring(1);
      return context[key];
    }
    return value;
  }

  hasConditions(): boolean {
    return this.rules.length > 0;
  }
}
