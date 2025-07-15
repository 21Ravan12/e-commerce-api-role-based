# Docker Configuration for E-Commerce API

## .dockerignore
node_modules
.git
*.log
.env.local
Dockerfile
docker-compose*
logs/
test/
docs/
!/.env

## docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  mongodb_data:

## Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY .env .                     
COPY src/ ./src/

# Create logs directory
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health')"

EXPOSE 3000

# Run as non-root user
USER node

CMD ["node", "src/server.js"]

## Key Features
- Production-ready Node.js environment
- Persistent MongoDB storage
- Isolated Redis instance
- Automatic restart policy
- Health checking
- Non-root user security
- Proper file permissions for logs
- Minimal production dependencies
- Environment variable support