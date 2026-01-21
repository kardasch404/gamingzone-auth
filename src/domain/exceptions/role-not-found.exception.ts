import { DomainException } from './domain.exception';

export class RoleNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Role ${identifier} not found`);
  }
}
