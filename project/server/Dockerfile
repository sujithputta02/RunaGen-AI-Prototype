# Use lightweight Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (cache-friendly)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source code
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose API port
EXPOSE 3001

# Start server
CMD ["node", "src/server.js"]
