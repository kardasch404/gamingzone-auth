import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { BaseEvent } from '../events/event-schemas';
import { generateId } from '../../../shared/utils/uuid.util';

@Injectable()
export class EventPublisherService {
  private readonly maxRetries: number;
  private readonly initialRetryTime: number;
  private readonly multiplier: number;

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get('kafka.retry.maxRetries', 3);
    this.initialRetryTime = this.configService.get('kafka.retry.initialRetryTime', 100);
    this.multiplier = this.configService.get('kafka.retry.multiplier', 2);
  }

  async publishUserEvent(event: Omit<BaseEvent, 'metadata' | 'timestamp'>): Promise<void> {
    const topic = this.configService.get('kafka.topics.userEvents');
    await this.publishWithRetry(topic, this.enrichEvent(event));
  }

  async publishRoleEvent(event: Omit<BaseEvent, 'metadata' | 'timestamp'>): Promise<void> {
    const topic = this.configService.get('kafka.topics.roleEvents');
    await this.publishWithRetry(topic, this.enrichEvent(event));
  }

  async publishPermissionEvent(event: Omit<BaseEvent, 'metadata' | 'timestamp'>): Promise<void> {
    const topic = this.configService.get('kafka.topics.permissionEvents');
    await this.publishWithRetry(topic, this.enrichEvent(event));
  }

  private enrichEvent(event: any): BaseEvent {
    return {
      ...event,
      timestamp: new Date().toISOString(),
      metadata: {
        correlationId: generateId(),
        causationId: generateId(),
      },
    };
  }

  private async publishWithRetry(topic: string, event: BaseEvent, attempt = 0): Promise<void> {
    try {
      await this.kafkaProducer.send(topic, event);
    } catch (error) {
      if (attempt < this.maxRetries) {
        const delay = this.initialRetryTime * Math.pow(this.multiplier, attempt);
        await this.sleep(delay);
        return this.publishWithRetry(topic, event, attempt + 1);
      } else {
        await this.sendToDLQ(event, error);
        throw error;
      }
    }
  }

  private async sendToDLQ(event: BaseEvent, error: any): Promise<void> {
    try {
      const dlqTopic = this.configService.get('kafka.topics.dlq');
      await this.kafkaProducer.send(dlqTopic, {
        originalEvent: event,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (dlqError) {
      console.error('Failed to send to DLQ:', dlqError);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
