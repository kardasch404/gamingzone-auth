import { DomainException } from './domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User ${identifier} not found`);
  }
}
