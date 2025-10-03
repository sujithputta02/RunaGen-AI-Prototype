# Use lightweight Node.js image
FROM node:20-alpine

# Install system dependencies for PDF processing and OCR
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S runagen -u 1001

# Install dependencies first (cache-friendly)
COPY package*.json ./
RUN npm ci --omit=dev --silent || npm install --omit=dev --silent

# Copy source code
COPY --chown=runagen:nodejs . .

# Create necessary directories
RUN mkdir -p temp data && \
    chown -R runagen:nodejs temp data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER runagen

# Expose API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start server
CMD ["node", "src/server.js"]
