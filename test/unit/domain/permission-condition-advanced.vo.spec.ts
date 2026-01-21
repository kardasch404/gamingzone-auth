import { PermissionCondition, ConditionOperator } from '../../../src/domain/value-objects/permission-condition.vo';

describe('PermissionCondition - Logical Operators', () => {
  it('should evaluate AND condition', () => {
    const condition = new PermissionCondition({
      and: [
        { field: 'userId', operator: ConditionOperator.EQ, value: '@currentUser' },
        { field: 'status', operator: ConditionOperator.IN, value: ['ACTIVE', 'PENDING'] },
      ],
    });

    expect(condition.evaluate({ userId: '123', currentUser: '123', status: 'ACTIVE' })).toBe(true);
    expect(condition.evaluate({ userId: '123', currentUser: '456', status: 'ACTIVE' })).toBe(false);
    expect(condition.evaluate({ userId: '123', currentUser: '123', status: 'DELETED' })).toBe(false);
  });

  it('should evaluate OR condition', () => {
    const condition = new PermissionCondition({
      or: [
        { field: 'role', operator: ConditionOperator.EQ, value: 'admin' },
        { field: 'userId', operator: ConditionOperator.EQ, value: '@currentUser' },
      ],
    });

    expect(condition.evaluate({ role: 'admin', userId: '123', currentUser: '456' })).toBe(true);
    expect(condition.evaluate({ role: 'user', userId: '123', currentUser: '123' })).toBe(true);
    expect(condition.evaluate({ role: 'user', userId: '123', currentUser: '456' })).toBe(false);
  });

  it('should evaluate NOT condition', () => {
    const condition = new PermissionCondition({
      not: { field: 'status', operator: ConditionOperator.EQ, value: 'DELETED' },
    });

    expect(condition.evaluate({ status: 'ACTIVE' })).toBe(true);
    expect(condition.evaluate({ status: 'DELETED' })).toBe(false);
  });

  it('should evaluate nested conditions', () => {
    const condition = new PermissionCondition({
      and: [
        { field: 'userId', operator: ConditionOperator.EQ, value: '@currentUser' },
        {
          or: [
            { field: 'role', operator: ConditionOperator.EQ, value: 'admin' },
            { field: 'status', operator: ConditionOperator.EQ, value: 'ACTIVE' },
          ],
        },
      ],
    });

    expect(condition.evaluate({ userId: '123', currentUser: '123', role: 'admin', status: 'INACTIVE' })).toBe(true);
    expect(condition.evaluate({ userId: '123', currentUser: '123', role: 'user', status: 'ACTIVE' })).toBe(true);
    expect(condition.evaluate({ userId: '123', currentUser: '456', role: 'admin', status: 'ACTIVE' })).toBe(false);
  });

  it('should evaluate comparison operators', () => {
    const condition = new PermissionCondition({
      and: [
        { field: 'age', operator: ConditionOperator.GTE, value: 18 },
        { field: 'age', operator: ConditionOperator.LT, value: 65 },
      ],
    });

    expect(condition.evaluate({ age: 25 })).toBe(true);
    expect(condition.evaluate({ age: 17 })).toBe(false);
    expect(condition.evaluate({ age: 65 })).toBe(false);
  });

  it('should resolve context variables', () => {
    const condition = new PermissionCondition({
      field: 'ownerId',
      operator: ConditionOperator.EQ,
      value: '@currentUser',
    });

    expect(condition.evaluate({ ownerId: '123', currentUser: '123' })).toBe(true);
    expect(condition.evaluate({ ownerId: '123', currentUser: '456' })).toBe(false);
  });
});
