# 🎮 GamingZone Auth - Command Cheat Sheet

## 📦 DOCKER COMMANDS

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart a specific service
docker-compose restart auth-service
```

### View Logs
```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Specific service logs
docker logs gamingzone-auth
docker logs postgres-auth
docker logs redis
docker logs rabbitmq

# Last 50 lines
docker logs gamingzone-auth --tail 50

# Follow specific service
docker logs -f gamingzone-auth
```

### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop gamingzone-auth

# Remove a container
docker rm gamingzone-auth

# Execute command in container
docker exec -it gamingzone-auth sh
```

## 🗄️ DATABASE COMMANDS

### Connect to PostgreSQL
```bash
# Connect to database
docker exec -it postgres-auth psql -U gamingzone -d auth_db

# Run SQL query
docker exec postgres-auth psql -U gamingzone -d auth_db -c "SELECT * FROM users;"

# List all tables
docker exec postgres-auth psql -U gamingzone -d auth_db -c "\dt"

# Describe table structure
docker exec postgres-auth psql -U gamingzone -d auth_db -c "\d users"
```

### Prisma Commands
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## 🔴 REDIS COMMANDS

```bash
# Ping Redis
docker exec redis redis-cli ping

# Get all keys
docker exec redis redis-cli keys '*'

# Get a value
docker exec redis redis-cli get "key_name"

# Set a value
docker exec redis redis-cli set "test" "hello"

# Delete a key
docker exec redis redis-cli del "key_name"

# Flush all data (⚠️ deletes everything)
docker exec redis redis-cli flushall
```

## 🐰 RABBITMQ COMMANDS

```bash
# List queues
docker exec rabbitmq rabbitmqctl list_queues

# List exchanges
docker exec rabbitmq rabbitmqctl list_exchanges

# List connections
docker exec rabbitmq rabbitmqctl list_connections

# Access Management UI
open http://localhost:15672
# Username: guest
# Password: guest
```

## 🚀 APPLICATION COMMANDS

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build application
npm run build

# Start production
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:42110/api/v1/health

# Pretty print JSON
curl http://localhost:42110/api/v1/health | jq .

# Test with headers
curl -H "Content-Type: application/json" http://localhost:42110/api/v1/health

# POST request
curl -X POST http://localhost:42110/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔍 DEBUGGING COMMANDS

### Check Service Status
```bash
# Check all services
docker ps

# Check specific port
lsof -i :42110

# Check container health
docker inspect gamingzone-auth | jq '.[0].State'

# View container resource usage
docker stats gamingzone-auth
```

### View Application Logs
```bash
# Real-time logs
docker logs -f gamingzone-auth

# Search logs for errors
docker logs gamingzone-auth 2>&1 | grep -i error

# Last 100 lines
docker logs gamingzone-auth --tail 100

# Logs since 10 minutes ago
docker logs gamingzone-auth --since 10m
```

## 🧹 CLEANUP COMMANDS

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (⚠️ nuclear option)
docker system prune -a --volumes

# Remove specific service data
docker-compose down -v
```

## 📊 MONITORING COMMANDS

```bash
# Check disk usage
docker system df

# Monitor container resources
docker stats

# Check network
docker network ls
docker network inspect gamingzone-auth_gamingzone-network

# Check volumes
docker volume ls
docker volume inspect gamingzone-auth_postgres-auth-data
```

## 🔧 TROUBLESHOOTING

### Service Won't Start
```bash
# Check logs
docker logs gamingzone-auth

# Check if port is in use
lsof -i :42110

# Kill process on port
lsof -ti:42110 | xargs kill -9

# Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

### Database Issues
```bash
# Check connection
docker exec postgres-auth pg_isready -U gamingzone

# Reset database
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Redis Issues
```bash
# Check connection
docker exec redis redis-cli ping

# View Redis info
docker exec redis redis-cli info

# Monitor Redis commands
docker exec redis redis-cli monitor
```

## 🌐 USEFUL URLS

- **Auth Service**: http://localhost:42110
- **Swagger Docs**: http://localhost:42110/api/docs
- **Health Check**: http://localhost:42110/api/v1/health
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)

## 💡 QUICK TIPS

```bash
# One-liner to restart everything
docker-compose down && docker-compose up --build -d

# Check if everything is running
docker ps | grep -E "gamingzone|postgres|redis|rabbitmq"

# View all logs together
docker-compose logs -f

# Quick health check
curl -s http://localhost:42110/api/v1/health | jq .
```

## 🎯 COMMON WORKFLOWS

### Starting Fresh
```bash
docker-compose down -v
docker-compose up --build -d
sleep 20
curl http://localhost:42110/api/v1/health
```

### Updating Code
```bash
# Code changes auto-reload in dev mode
# Just edit files in src/

# If you need to rebuild:
docker-compose restart auth-service
```

### Checking Everything
```bash
docker ps
docker logs gamingzone-auth --tail 20
curl http://localhost:42110/api/v1/health | jq .
```
