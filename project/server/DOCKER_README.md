# RunaGen Backend - Docker Setup

This directory contains the Docker configuration for the RunaGen AI Career Companion backend server.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured in `.env` file

### 1. Build the Docker Image

**Linux/Mac:**
```bash
# Make scripts executable
chmod +x docker-*.sh

# Build the image
./docker-build.sh
```

**Windows:**
```cmd
# Run the batch file
docker-build.bat
```

**Manual build:**
```bash
docker build -t runagen-backend:latest .
```

### 2. Configure Environment
Copy and update the `.env` file with your credentials:
```bash
cp .env.example .env
# Edit .env with your actual API keys and database URLs
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `GOOGLE_API_KEY` - Google Gemini API key
- `VERTEX_PROJECT_ID` - Google Cloud project ID (optional)
- `VERTEX_LOCATION` - Vertex AI location (default: us-central1)

### 3. Start the Backend

**Linux/Mac:**
```bash
./docker-run.sh
```

**Windows:**
```cmd
docker-run.bat
```

**Manual start:**
```bash
docker-compose up -d
```

### 4. Verify Installation
```bash
# Check health
curl http://localhost:3001/health

# View logs
docker-compose logs -f backend
```

## Docker Commands

### Development
```bash
# Build image
docker build -t runagen-backend:latest .

# Run container
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop container
docker-compose down

# Restart container
docker-compose restart backend
```

### Production
```bash
# Build optimized image
docker build --target production -t runagen-backend:prod .

# Run with resource limits
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Container Features

### Security
- Runs as non-root user (`runagen:1001`)
- Minimal Alpine Linux base image
- Read-only credential mounting
- Resource limits configured

### Monitoring
- Health check endpoint: `/health`
- Automatic restart on failure
- Container resource monitoring
- Structured logging

### Performance
- Multi-stage build optimization
- Dependency caching
- Volume mounting for persistent data
- Memory and CPU limits

## Recent Fixes

### YouTube Service Error Fix
✅ **Fixed:** The YouTube service error `Cannot read properties of undefined (reading 'videos')` has been resolved. The service now properly handles cases where the usetube library returns undefined results and gracefully falls back to mock data.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   # Kill the process or change port in docker-compose.yml
   ```

2. **Permission denied**
   ```bash
   # Make scripts executable
   chmod +x docker-*.sh
   ```

3. **Build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   # Rebuild without cache
   docker build --no-cache -t runagen-backend:latest .
   ```

4. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs backend
   # Check environment variables
   docker-compose config
   ```

### Logs and Debugging
```bash
# View real-time logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend sh

# Check container stats
docker stats runagen-backend

# Inspect container
docker inspect runagen-backend
```

## File Structure
```
server/
├── Dockerfile              # Main Docker configuration
├── docker-compose.yml      # Service orchestration
├── .dockerignore           # Files to exclude from build
├── docker-build.sh         # Build script (Linux/Mac)
├── docker-run.sh           # Run script (Linux/Mac)
├── docker-stop.sh          # Stop script (Linux/Mac)
├── docker-build.bat        # Build script (Windows)
├── docker-run.bat          # Run script (Windows)
├── docker-stop.bat         # Stop script (Windows)
├── DOCKER_README.md        # This file
└── src/                    # Application source code
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | No |
| `PORT` | Server port | `3001` | No |
| `MONGODB_URI` | MongoDB connection | - | Yes |
| `GOOGLE_API_KEY` | Gemini API key | - | Yes |
| `VERTEX_PROJECT_ID` | GCP project ID | - | No |
| `VERTEX_LOCATION` | Vertex AI region | `us-central1` | No |
| `VERTEX_MODEL` | AI model name | `gemini-2.5-flash` | No |
| `YOUTUBE_API_KEY` | YouTube API key | - | No |

## Production Deployment

For production deployment, consider:
- Using Docker secrets for sensitive data
- Setting up reverse proxy (nginx)
- Configuring SSL/TLS certificates
- Setting up monitoring and alerting
- Using container orchestration (Kubernetes)
- Implementing backup strategies

## Support

For issues and questions:
1. Check the logs: `docker-compose logs backend`
2. Verify environment configuration
3. Check Docker and system resources
4. Review the main project documentation