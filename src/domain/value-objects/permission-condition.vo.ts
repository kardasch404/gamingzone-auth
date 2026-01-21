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
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  and?: any[];
  or?: any[];
  not?: any;
}

export class PermissionCondition {
  private readonly condition: any;

  constructor(conditions: Record<string, any> | null) {
    this.condition = conditions;
  }

  evaluate(context: Record<string, any>): boolean {
    if (!this.condition) return true;
    return this.evaluateCondition(this.condition, context);
  }

  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    // Handle logical operators
    if (condition.and) {
      return condition.and.every((c: any) => this.evaluateCondition(c, context));
    }
    if (condition.or) {
      return condition.or.some((c: any) => this.evaluateCondition(c, context));
    }
    if (condition.not) {
      return !this.evaluateCondition(condition.not, context);
    }

    // Handle comparison operators
    if (condition.field && condition.operator) {
      return this.evaluateRule(condition, context);
    }

    return true;
  }

  private evaluateRule(rule: ConditionRule, context: Record<string, any>): boolean {
    const contextValue = context[rule.field!];
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
    return this.condition !== null && Object.keys(this.condition).length > 0;
  }
}
