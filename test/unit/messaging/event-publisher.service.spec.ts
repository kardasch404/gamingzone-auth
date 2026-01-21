import { EventPublisherService } from '../../../src/infrastructure/messaging/kafka/event-publisher.service';
import { KafkaProducerService } from '../../../src/infrastructure/messaging/kafka/kafka-producer.service';
import { ConfigService } from '@nestjs/config';

describe('EventPublisherService', () => {
  let service: EventPublisherService;
  let kafkaProducer: jest.Mocked<KafkaProducerService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    kafkaProducer = {
      send: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          'kafka.retry.maxRetries': 3,
          'kafka.retry.initialRetryTime': 100,
          'kafka.retry.multiplier': 2,
          'kafka.topics.userEvents': 'gamingzone.auth.user-events',
          'kafka.topics.roleEvents': 'gamingzone.auth.role-events',
          'kafka.topics.dlq': 'gamingzone.auth.dlq',
        };
        return config[key] || defaultValue;
      }),
    } as any;

    service = new EventPublisherService(kafkaProducer, configService);
  });

  describe('publishUserEvent', () => {
    it('should publish user event successfully', async () => {
      const event = {
        eventType: 'user.registered',
        version: '1.0',
        data: { userId: 'user-1', email: 'test@example.com', roles: [] },
      };

      await service.publishUserEvent(event);

      expect(kafkaProducer.send).toHaveBeenCalledWith(
        'gamingzone.auth.user-events',
        expect.objectContaining({
          eventType: 'user.registered',
          version: '1.0',
          timestamp: expect.any(String),
          metadata: expect.objectContaining({
            correlationId: expect.any(String),
            causationId: expect.any(String),
          }),
        }),
      );
    });

    it('should retry on failure', async () => {
      const event = {
        eventType: 'user.registered',
        version: '1.0',
        data: { userId: 'user-1', email: 'test@example.com', roles: [] },
      };

      kafkaProducer.send
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      await service.publishUserEvent(event);

      expect(kafkaProducer.send).toHaveBeenCalledTimes(3);
    });

    it('should send to DLQ after max retries', async () => {
      const event = {
        eventType: 'user.registered',
        version: '1.0',
        data: { userId: 'user-1', email: 'test@example.com', roles: [] },
      };

      kafkaProducer.send.mockRejectedValue(new Error('Persistent error'));

      await expect(service.publishUserEvent(event)).rejects.toThrow();

      expect(kafkaProducer.send).toHaveBeenCalledWith(
        'gamingzone.auth.dlq',
        expect.objectContaining({
          originalEvent: expect.any(Object),
          error: 'Persistent error',
        }),
      );
    });
  });

  describe('publishRoleEvent', () => {
    it('should publish role event successfully', async () => {
      const event = {
        eventType: 'role.created',
        version: '1.0',
        data: { roleId: 'role-1', name: 'ADMIN', isSystem: false },
      };

      await service.publishRoleEvent(event);

      expect(kafkaProducer.send).toHaveBeenCalledWith(
        'gamingzone.auth.role-events',
        expect.any(Object),
      );
    });
  });
});
