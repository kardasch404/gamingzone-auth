import { DomainException } from './domain.exception';

export class SystemRoleException extends DomainException {
  constructor() {
    super('System roles cannot be modified or deleted');
  }
}
