# Deployment Guide

## Overview

This guide covers deploying the Mutual Fund Insight Engine to production environments.

## Prerequisites

- Docker & Docker Compose
- PostgreSQL instance (managed service recommended)
- Groq API key
- Node.js 18+ (if deploying without Docker)
- A web server (Nginx/Apache) for reverse proxy

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Local Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run prisma:migrate

# Seed database
docker-compose exec backend npm run seed

# View logs
docker-compose logs -f
```

#### Docker Push to Registry

```bash
# Build images with registry prefix
docker build -t your-registry/mutual-fund-backend:latest backend/
docker build -t your-registry/mutual-fund-frontend:latest frontend/

# Push to registry
docker push your-registry/mutual-fund-backend:latest
docker push your-registry/mutual-fund-frontend:latest
```

### 2. Heroku Deployment

#### Backend

```bash
cd backend

# Create Heroku app
heroku create mutual-fund-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set GROQ_API_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate
```

#### Frontend

```bash
cd frontend

# Create Heroku app
heroku create mutual-fund-frontend

# Set build vars
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api

# Deploy
git push heroku main
```

### 3. AWS Deployment

#### Using ECS + RDS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your_account_id.dkr.ecr.us-east-1.amazonaws.com

docker build -t mutual-fund-backend backend/
docker tag mutual-fund-backend:latest your_account_id.dkr.ecr.us-east-1.amazonaws.com/mutual-fund-backend:latest
docker push your_account_id.dkr.ecr.us-east-1.amazonaws.com/mutual-fund-backend:latest
```

### 4. DigitalOcean App Platform

1. Connect your GitHub repository
2. Create backend service:
   - Source: GitHub repo → backend directory
   - Build: `npm install && npm run build`
   - Run: `npm start`
   - Port: 3000
3. Create frontend service:
   - Source: GitHub repo → frontend directory
   - Build: `npm install && npm run build`
   - Run: `npm start`
   - Port: 3001
4. Add PostgreSQL database
5. Set environment variables in App Spec

## Environment Variables

### Backend
```
DATABASE_URL=postgresql://user:password@host:5432/db
GROQ_API_KEY=gsk-...
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Database Setup

### PostgreSQL Connection

```bash
# Connect to remote database
psql "postgresql://user:password@host:5432/mutual_funds"

# Run migrations
npm run prisma:migrate

# Seed production data
npm run seed
```

## SSL/HTTPS Configuration

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

### Backend

```typescript
// Add caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});

// Add compression
import compression from 'compression';
app.use(compression());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

### Frontend

- Enable Next.js image optimization
- Configure ISR (Incremental Static Regeneration)
- Use CDN for static assets
- Enable Gzip compression

## Monitoring

### Logging

```typescript
// Backend logging
import logger from './utils/logger';

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Error Tracking

- Integrate with Sentry
- Set up application performance monitoring
- Configure log aggregation

## Backup Strategy

```bash
# Daily PostgreSQL backups
pg_dump "postgresql://user:pw@host/db" > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_*.sql

# Upload to S3
aws s3 cp backup_*.sql.gz s3://your-bucket/backups/
```

## Maintenance

- Regular database backups
- Update dependencies monthly
- Monitor API response times
- Track error rates
- Analyze fund data freshness

## Domain Setup

### DNS Records

```
A Record: yourdomain.com → your_server_ip
A Record: api.yourdomain.com → your_api_server_ip
CNAME: www.yourdomain.com → yourdomain.com
```

### Email Configuration (Optional)

```
MX Record: yourdomain.com
SPF Record: v=spf1 include:_spf.yourdomain.com ~all
```

## Scaling

### Horizontal Scaling

1. Load Balance across multiple backend instances
2. Use managed PostgreSQL service
3. Cache frequently accessed data

### Vertical Scaling

1. Increase server resources as needed
2. Monitor memory usage
3. Optimize database queries

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql "postgresql://user:pw@host:5432/db"

# Check API health
curl http://localhost:3000/health
```

### Performance Issues

```bash
# Check Node.js memory usage
node --max_old_space_size=4096 index.js

# Profile with clinic
clinic doctor -- node index.js
```

## Rollback Procedure

```bash
# If deployment fails
docker-compose down
git revert HEAD
docker-compose up -d
```

---

For production deployments, ensure:
- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ Database backups configured
- ✅ Monitoring set up
- ✅ Error handling implemented
- ✅ Rate limiting enabled
