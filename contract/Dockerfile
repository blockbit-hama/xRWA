FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Compile contracts
RUN npm run compile

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hardhat -u 1001

# Change ownership of the app directory
RUN chown -R hardhat:nodejs /app
USER hardhat

# Expose port
EXPOSE 8545

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8545 || exit 1

# Start hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]