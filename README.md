# gamingzone-auth

Authentication and Authorization microservice for GamingZone platform.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control (RBAC)
- REST API, GraphQL, and gRPC support
- Clean Architecture with DDD principles

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- GraphQL
- gRPC

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

- REST API: http://localhost:4001/api/docs
- GraphQL Playground: http://localhost:4001/graphql

## Ports

- REST API: 4001
- gRPC: 5001

## Architecture

Follows Clean Architecture with:
- **Domain Layer**: Business entities and logic
- **Application Layer**: Use cases and DTOs
- **Infrastructure Layer**: Database, external services
- **Presentation Layer**: Controllers, resolvers, gRPC services
