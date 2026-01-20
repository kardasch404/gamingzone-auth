import { ConditionEvaluator } from '../../src/shared/utils/condition-evaluator.util';

describe('ConditionEvaluator', () => {
  it('should return true when no conditions', () => {
    expect(ConditionEvaluator.evaluate(null, {})).toBe(true);
    expect(ConditionEvaluator.evaluate({}, {})).toBe(true);
  });

  it('should evaluate userId condition', () => {
    const conditions = { userId: 'user123' };
    expect(ConditionEvaluator.evaluate(conditions, { userId: 'user123' })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { userId: 'user456' })).toBe(false);
  });

  it('should evaluate ownerId condition', () => {
    const conditions = { ownerId: 'owner123' };
    expect(ConditionEvaluator.evaluate(conditions, { ownerId: 'owner123' })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { ownerId: 'owner456' })).toBe(false);
  });

  it('should evaluate minAmount condition', () => {
    const conditions = { minAmount: 100 };
    expect(ConditionEvaluator.evaluate(conditions, { amount: 150 })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { amount: 100 })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { amount: 50 })).toBe(false);
  });

  it('should evaluate maxAmount condition', () => {
    const conditions = { maxAmount: 1000 };
    expect(ConditionEvaluator.evaluate(conditions, { amount: 500 })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { amount: 1000 })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { amount: 1500 })).toBe(false);
  });

  it('should evaluate multiple conditions', () => {
    const conditions = { userId: 'user123', status: 'active', minAmount: 100 };
    expect(ConditionEvaluator.evaluate(conditions, { userId: 'user123', status: 'active', amount: 150 })).toBe(true);
    expect(ConditionEvaluator.evaluate(conditions, { userId: 'user123', status: 'inactive', amount: 150 })).toBe(false);
    expect(ConditionEvaluator.evaluate(conditions, { userId: 'user456', status: 'active', amount: 150 })).toBe(false);
  });

  it('should return false when context is missing', () => {
    const conditions = { userId: 'user123' };
    expect(ConditionEvaluator.evaluate(conditions, null)).toBe(false);
  });
});
