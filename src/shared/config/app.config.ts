import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 4001,
  grpcPort: parseInt(process.env.GRPC_PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  graphqlPlayground: process.env.GRAPHQL_PLAYGROUND === 'true',
}));
