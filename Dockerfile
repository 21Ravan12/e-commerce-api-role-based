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