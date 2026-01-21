export default () => ({
  kafka: {
    clientId: 'gamingzone-auth',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topics: {
      userEvents: 'gamingzone.auth.user-events',
      roleEvents: 'gamingzone.auth.role-events',
      permissionEvents: 'gamingzone.auth.permission-events',
      dlq: 'gamingzone.auth.dlq',
    },
    retry: {
      maxRetries: 3,
      initialRetryTime: 100,
      multiplier: 2,
    },
  },
});
