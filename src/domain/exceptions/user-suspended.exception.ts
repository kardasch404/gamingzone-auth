import { DomainException } from './domain.exception';

export class UserSuspendedException extends DomainException {
  constructor() {
    super('User account is suspended');
  }
}
