import { PermissionCondition, ConditionOperator } from '../../../src/domain/value-objects/permission-condition.vo';

describe('PermissionCondition Value Object', () => {
  it('should evaluate equality condition', () => {
    const condition = new PermissionCondition({
      userId: { operator: ConditionOperator.EQ, value: '@currentUser' },
    });

    expect(condition.evaluate({ userId: '123', currentUser: '123' })).toBe(true);
    expect(condition.evaluate({ userId: '123', currentUser: '456' })).toBe(false);
  });

  it('should evaluate IN condition', () => {
    const condition = new PermissionCondition({
      role: { operator: ConditionOperator.IN, value: ['admin', 'moderator'] },
    });

    expect(condition.evaluate({ role: 'admin' })).toBe(true);
    expect(condition.evaluate({ role: 'user' })).toBe(false);
  });

  it('should return true for no conditions', () => {
    const condition = new PermissionCondition(null);
    expect(condition.evaluate({})).toBe(true);
  });
});
