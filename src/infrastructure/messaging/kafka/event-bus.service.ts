import { Injectable } from '@nestjs/common';
import { IEventBus } from '../../../domain/interfaces/event-bus.interface';

@Injectable()
export class EventBusService implements IEventBus {
  async publish(event: any): Promise<void> {
    // TODO: Implement Kafka producer
    console.log('Event published:', event.constructor.name, event);
  }
}
