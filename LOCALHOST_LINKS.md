# 🎮 GamingZone Auth Service - Localhost Links

## ✅ Running Services

### 1. **Auth Service (NestJS)**
- **URL**: http://localhost:42110
- **API Docs (Swagger)**: http://localhost:42110/api/docs
- **Health Check**: http://localhost:42110/api/v1/health
- **Status**: ✅ Running

### 2. **PostgreSQL Database**
- **Host**: localhost
- **Port**: 5432
- **Database**: auth_db
- **User**: gamingzone
- **Password**: secure_password
- **Connection String**: `postgresql://gamingzone:secure_password@localhost:5432/auth_db`
- **Status**: ✅ Running

### 3. **Redis Cache**
- **Host**: localhost
- **Port**: 6379
- **URL**: redis://localhost:6379
- **Test**: `docker exec redis redis-cli ping` → PONG
- **Status**: ✅ Running

### 4. **RabbitMQ Message Queue**
- **AMQP Port**: 5672
- **Management UI**: http://localhost:15672
- **Default Credentials**: 
  - Username: `guest`
  - Password: `guest`
- **Status**: ✅ Running

## 🧪 Test Commands

```bash
# Test PostgreSQL
docker exec postgres-auth pg_isready -U gamingzone

# Test Redis
docker exec redis redis-cli ping

# Test RabbitMQ
curl http://localhost:15672

# Test Auth Service Health
curl http://localhost:42110/api/v1/health

# View Auth Service Swagger Docs
open http://localhost:42110/api/docs
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f auth-service
docker-compose logs -f postgres-auth
docker-compose logs -f redis
docker-compose logs -f rabbitmq

# Restart a service
docker-compose restart auth-service
```

## 📊 Service Status Check

```bash
# Check all running containers
docker ps

# Check service health
curl http://localhost:42110/api/v1/health | jq .
```

## 🔧 Development

```bash
# Run locally (without Docker)
npm run start:dev

# Build
npm run build

# Run production
npm run start:prod

# Run tests
npm run test

# Run migrations
npx prisma migrate dev
```

## 📝 Notes

- All services are running in Docker containers
- Auth service is accessible at port 42110
- Database migrations have been applied
- Redis and RabbitMQ are ready for use
- Swagger documentation is available for API exploration
