import { Injectable } from '@nestjs/common';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';
import { EventPublisherService } from './event-publisher.service';

@Injectable()
export class EventBusService implements IEventBus {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async publish(event: any): Promise<void> {
    const eventType = event.constructor.name;
    
    if (eventType.includes('User')) {
      await this.eventPublisher.publishUserEvent({
        eventType: this.toKebabCase(eventType),
        version: '1.0',
        data: event,
      });
    } else if (eventType.includes('Role')) {
      await this.eventPublisher.publishRoleEvent({
        eventType: this.toKebabCase(eventType),
        version: '1.0',
        data: event,
      });
    } else if (eventType.includes('Permission')) {
      await this.eventPublisher.publishPermissionEvent({
        eventType: this.toKebabCase(eventType),
        version: '1.0',
        data: event,
      });
    }
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase().replace('event', '');
  }
}
