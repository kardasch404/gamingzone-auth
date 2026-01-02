# E2E Tests

## Setup

1. Start test database:
```bash
npm run test:e2e:setup
```

2. Run E2E tests:
```bash
npm run test:e2e
```

3. Teardown test database:
```bash
npm run test:e2e:teardown
```

## Test Database

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`
- Uses tmpfs for faster performance
- Automatically cleaned after each test

## Test Coverage

- `/api/v1/auth/register` - User registration
- `/api/v1/auth/verify-email` - Email verification
