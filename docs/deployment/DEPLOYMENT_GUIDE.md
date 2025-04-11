# Deployment Guide

## Overview
This guide provides detailed instructions for deploying the Vibewell application to a production environment, including infrastructure setup, configuration, and monitoring.

## Prerequisites

### Infrastructure Requirements
- Kubernetes cluster
- Redis instance
- PostgreSQL database
- Object storage
- CDN configuration
- SSL certificates
- Domain configuration

### Software Requirements
- Docker
- kubectl
- Helm
- Terraform
- Git
- Node.js
- npm

## Environment Setup

### Configuration Files
1. `.env.production`
2. `kustomization.yaml`
3. `values.yaml`
4. `terraform.tfvars`
5. `docker-compose.prod.yml`

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Storage
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=your-region

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=100
```

## Deployment Steps

### 1. Infrastructure Setup
```bash
# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure changes
terraform apply
```

### 2. Kubernetes Setup
```bash
# Create namespace
kubectl create namespace vibewell

# Apply base configuration
kubectl apply -k kustomize/base

# Apply production overlay
kubectl apply -k kustomize/production
```

### 3. Application Deployment
```bash
# Build Docker image
docker build -t vibewell:latest .

# Push to registry
docker push your-registry/vibewell:latest

# Deploy with Helm
helm upgrade --install vibewell ./charts/vibewell \
  --namespace vibewell \
  --values values.yaml
```

## Monitoring Setup

### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vibewell'
    static_configs:
      - targets: ['vibewell:8080']
```

### Grafana Dashboards
1. Application Metrics
2. Infrastructure Metrics
3. Business Metrics
4. Security Metrics
5. Performance Metrics

## Security Configuration

### SSL/TLS
```bash
# Generate certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt

# Create Kubernetes secret
kubectl create secret tls vibewell-tls \
  --key tls.key \
  --cert tls.crt
```

### Security Headers
```nginx
add_header Content-Security-Policy "default-src 'self'";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

## Backup Strategy

### Database Backups
```bash
# Daily backup
pg_dump -U user -d dbname > backup.sql

# Restore
psql -U user -d dbname < backup.sql
```

### File Storage Backups
```bash
# Backup to S3
aws s3 sync /path/to/files s3://your-bucket/backups/

# Restore from S3
aws s3 sync s3://your-bucket/backups/ /path/to/files
```

## Monitoring & Alerts

### Prometheus Alerts
```yaml
groups:
- name: vibewell
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
```

### Grafana Alerts
1. Error rate threshold
2. Response time threshold
3. Resource usage threshold
4. Security event alerts
5. Business metric alerts

## Maintenance

### Regular Tasks
1. Update dependencies
2. Apply security patches
3. Rotate secrets
4. Clean up old backups
5. Review logs

### Emergency Procedures
1. Incident response
2. Rollback procedures
3. Data recovery
4. Security breach
5. Performance issues

## Troubleshooting

### Common Issues
1. Deployment failures
2. Performance problems
3. Security alerts
4. Database issues
5. Network problems

### Solutions
1. Check logs
2. Review metrics
3. Verify configuration
4. Test connectivity
5. Contact support 