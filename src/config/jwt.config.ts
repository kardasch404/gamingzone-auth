import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenSecret: process.env.JWT_SECRET || 'default-access-secret',
  accessTokenExpiry: '15m',
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-refresh-secret',
  refreshTokenExpiry: '7d',
}));
