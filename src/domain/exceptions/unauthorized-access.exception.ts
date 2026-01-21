import { DomainException } from './domain.exception';

export class UnauthorizedAccessException extends DomainException {
  constructor(resource?: string) {
    super(resource ? `Unauthorized access to ${resource}` : 'Unauthorized access');
  }
}
