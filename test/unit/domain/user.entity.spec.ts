import { User, UserStatus } from '../../../src/domain/entities/user.entity';

describe('User Entity', () => {
  it('should create a new user', () => {
    const user = User.create('1', 'test@example.com', 'hashedpass', 'John', 'Doe');

    expect(user.id).toBe('1');
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.isActive).toBe(true);
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.emailVerified).toBe(false);
  });

  it('should suspend user', () => {
    const user = User.create('1', 'test@example.com', 'hashedpass');
    user.suspend();

    expect(user.status).toBe(UserStatus.SUSPENDED);
    expect(user.isActive).toBe(false);
    expect(user.isSuspended()).toBe(true);
  });

  it('should not allow suspended user to login', () => {
    const user = User.create('1', 'test@example.com', 'hashedpass');
    user.suspend();

    expect(user.canLogin()).toBe(false);
  });

  it('should verify email', () => {
    const user = User.create('1', 'test@example.com', 'hashedpass');
    user.verifyEmail();

    expect(user.emailVerified).toBe(true);
  });
});
