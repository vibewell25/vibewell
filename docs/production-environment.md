# Vibewell Production Environment Setup

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Setup](#infrastructure-setup)
   - [Cloud Provider Configuration](#cloud-provider-configuration)
   - [Server Requirements](#server-requirements)
   - [Network Architecture](#network-architecture)
3. [Deployment Architecture](#deployment-architecture)
   - [Containerization Strategy](#containerization-strategy)
   - [Orchestration](#orchestration)
   - [Database Configuration](#database-configuration)
4. [Scaling Configuration](#scaling-configuration)
   - [Horizontal Scaling](#horizontal-scaling)
   - [Vertical Scaling](#vertical-scaling)
   - [Auto-scaling Rules](#auto-scaling-rules)
   - [Load Balancing](#load-balancing)
5. [Security Hardening](#security-hardening)
   - [Network Security](#network-security)
   - [Application Security](#application-security)
   - [Data Security](#data-security)
   - [Access Control](#access-control)
6. [Backup Strategies](#backup-strategies)
   - [Database Backups](#database-backups)
   - [File Storage Backups](#file-storage-backups)
   - [Configuration Backups](#configuration-backups)
   - [Disaster Recovery](#disaster-recovery)
7. [Monitoring Setup](#monitoring-setup)
   - [Metrics Collection](#metrics-collection)
   - [Alerting Configuration](#alerting-configuration)
   - [Log Management](#log-management)
8. [Performance Optimization](#performance-optimization)
   - [Caching Strategy](#caching-strategy)
   - [CDN Configuration](#cdn-configuration)
   - [Database Optimization](#database-optimization)

## Overview

This document outlines the complete production environment setup for the Vibewell platform. It provides detailed guidelines for infrastructure configuration, scaling options, security hardening, and backup strategies to ensure a robust, secure, and high-performance production environment.

## Infrastructure Setup

### Cloud Provider Configuration

Vibewell uses AWS as its primary cloud provider with the following key services:

**Core Services:**
- **Compute**: AWS ECS (Elastic Container Service) with Fargate
- **Database**: MongoDB Atlas (hosted MongoDB)
- **Caching**: Amazon ElastiCache (Redis)
- **File Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **DNS**: Amazon Route 53

**Configuration Overview:**

1. **AWS Account Setup:**
   - Create a dedicated AWS organization with separate accounts for production, staging, and development
   - Implement AWS Organizations for centralized management
   - Configure Service Control Policies (SCPs) to enforce security guardrails

2. **Region Selection:**
   - Primary Region: us-east-1 (N. Virginia)
   - Secondary Region: us-west-2 (Oregon) for disaster recovery
   - Additional edge locations for CloudFront distribution

3. **Networking:**
   - Configure a dedicated VPC with public and private subnets
   - Set up Transit Gateway for secure VPC connections
   - Implement VPC endpoints for secure service access

### Server Requirements

**Application Servers:**
- **For ECS Fargate Tasks:**
  - 2 vCPU / 4GB memory (minimum)
  - 4 vCPU / 8GB memory (recommended)
  - Minimum of 3 tasks running in production

**Database Requirements:**
- MongoDB Atlas M30 cluster or higher
- 3-node replica set with automated backups
- 32GB RAM, 400GB storage (expandable)

**Cache Requirements:**
- ElastiCache Redis (cluster mode enabled)
- 2 shards with 1 primary and 2 replicas each
- Memory optimized node types (cache.r6g.large)

### Network Architecture

The Vibewell production network architecture follows a multi-tier design:

**Public Tier:**
- Application Load Balancers
- NAT Gateways
- API Gateway

**Application Tier (Private Subnets):**
- ECS Fargate tasks
- ElastiCache instances
- Service integration components

**Data Tier (Private Subnets):**
- MongoDB Atlas peering connection
- Dedicated encryption services
- Backup systems

**Network Security Controls:**
- Security groups at each layer
- Network ACLs at subnet boundaries
- WAF on public-facing endpoints

![Network Architecture Diagram]

## Deployment Architecture

### Containerization Strategy

Vibewell uses Docker containers for application deployment with the following structure:

**Container Images:**
- **Web Application**: Node.js frontend container
- **API Services**: Node.js API services containers
- **Background Workers**: Processing and scheduled task containers

**Image Management:**
- Base images from official Node.js image with specific version tags
- Multi-stage builds to minimize image size
- Immutable image tags using Git commit hashes
- AWS ECR for container registry

**Example Dockerfile for Web Application:**
```Dockerfile
# Build stage
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["npm", "start"]
```

### Orchestration

**ECS Configuration:**
- Fargate launch type for serverless container execution
- Task definitions with appropriate CPU/memory allocations
- Service definitions with desired task counts and deployment configuration
- Application Load Balancer for request distribution

**Deployment Strategy:**
- Blue/green deployment with CodeDeploy
- Canary testing for gradual traffic shifting
- Automatic rollback on health check failure
- Maximum 150% deployment capacity during deployments

**Example ECS Task Definition:**
```json
{
  "family": "vibewell-web",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/vibewellAppRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "vibewell-web",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/vibewell-web:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vibewell-web",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_URL",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT_ID:parameter/vibewell/production/SUPABASE_URL"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048"
}
```

### Database Configuration

**MongoDB Atlas Configuration:**
- M30 cluster (or higher based on load)
- 3-node replica set across availability zones
- TLS encryption for all connections
- IP allowlist limiting access to application VPC
- Database user with minimal required permissions

**Connection Configuration:**
- Connection pooling with appropriate limits
- Retry with exponential backoff for transient errors
- Read preference configuration (primaryPreferred)
- Monitoring and slow query logging enabled

**Index Strategy:**
- Comprehensive indexes based on query patterns
- Background index builds for production
- Regular index usage analysis and optimization
- Time-to-live (TTL) indexes for temporary data

## Scaling Configuration

### Horizontal Scaling

**Application Layer Scaling:**
- ECS services configured with minimum 3 tasks
- Target tracking scaling policies based on CPU utilization (70%)
- Additional step scaling based on request count
- Maximum task limit based on load testing (initial: 10)

**Configuration:**
```json
{
  "targetTrackingScalingPolicyConfiguration": {
    "targetValue": 70.0,
    "predefinedMetricSpecification": {
      "predefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "scaleOutCooldown": 60,
    "scaleInCooldown": 300
  }
}
```

**Database Scaling:**
- MongoDB Atlas automated scaling
- Storage auto-scaling when 80% capacity is reached
- Manual vertical scaling for significant capacity increases
- Read replicas for read-heavy workloads

### Vertical Scaling

**When to Vertically Scale:**
- Memory constraints despite optimization
- Single-threaded operations becoming bottlenecks
- Peak loads exceeding horizontal capacity

**Implementation Strategy:**
- Schedule maintenance window for vertical scaling
- Increase Fargate task CPU/memory configuration
- Upgrade database instance tiers during low-traffic periods
- Test performance after each scaling event

### Auto-scaling Rules

**ECS Service Auto-scaling:**
- Scale out when CPU > 70% for 3 minutes
- Scale out when memory > 75% for 3 minutes
- Scale out when request count > 1000 per target
- Scale in when CPU < 40% for 15 minutes
- Never scale below minimum of 3 tasks

**Database Auto-scaling:**
- Enable MongoDB Atlas auto-scaling
- Configure CPU utilization triggers (>70% for 10 minutes)
- Set maximum scaling limits based on budget constraints
- Alert on repeated scaling events for manual review

### Load Balancing

**Application Load Balancer (ALB) Configuration:**
- Internet-facing ALB for web traffic
- Internal ALB for service-to-service communication
- HTTPS with TLS 1.2+ enforcement
- HTTP to HTTPS redirection

**Target Group Configuration:**
- Health check path: `/api/health`
- Health check interval: 30 seconds
- Health check timeout: 5 seconds
- Healthy threshold: 3, Unhealthy threshold: 2
- Stickiness enabled for sessions (cookie-based)

**Traffic Distribution:**
- Round-robin algorithm for initial distribution
- Least outstanding requests for API endpoints
- Weighted target groups during deployments

## Security Hardening

### Network Security

**VPC Configuration:**
- No direct internet access from private subnets
- NAT gateways for outbound connectivity
- VPC Flow Logs enabled and stored in S3
- Security groups limited to specific ports/protocols

**Firewall Configuration:**
- AWS WAF rules to protect against OWASP Top 10
- Rate limiting rules (max 500 requests per IP per minute)
- Geo-blocking for countries with high attack rates
- IP reputation list filtering

**DDoS Protection:**
- AWS Shield Standard enabled
- CloudFront distributions for edge protection
- Route 53 for DNS protection
- Load balancer request throttling

### Application Security

**Web Application Firewall Rules:**
- SQL injection protection
- Cross-site scripting (XSS) protection
- Path traversal and LFI/RFI protection
- HTTP protocol violation protection
- Custom rules for application-specific threats

**API Security:**
- JWT authentication with short expiration (15 minutes)
- Rate limiting per user and endpoint
- Request validation with strict schemas
- Proper HTTP method enforcement
- CORS configuration with specific origins

**Dependency Security:**
- Regular dependency audits (weekly)
- Automated vulnerability scanning
- Container image scanning
- Security patches applied within 7 days (critical: 24 hours)

### Data Security

**Encryption Strategy:**
- Data encrypted at rest (S3, EBS, MongoDB)
- Data encrypted in transit (TLS 1.2+)
- Customer PII encrypted with customer-specific keys
- Database-level field encryption for sensitive data

**Key Management:**
- AWS KMS for key management
- Key rotation every 90 days
- Restricted key usage with IAM policies
- Audit logging for all key operations

**Access Controls:**
- Least privilege model for all data access
- Row-level security in database where applicable
- Attribute-based access control (ABAC)
- Time-limited access for administrative functions

### Access Control

**IAM Configuration:**
- Service roles with minimum required permissions
- No long-lived access keys for humans
- MFA required for all IAM users
- IAM Access Analyzer to identify unintended access

**Secrets Management:**
- AWS Secrets Manager for credential storage
- Automatic secret rotation
- Audit logging for secret access
- No hard-coded secrets in code or configurations

**Administrative Access:**
- Jump servers for administrative access
- Session recording for audit purposes
- Temporary elevated privileges using IAM roles
- Break-glass procedures for emergency access

## Backup Strategies

### Database Backups

**Automated Backup Schedule:**
- Daily full backups retained for 7 days
- Hourly incremental backups retained for 24 hours
- Weekly backups retained for 1 month
- Monthly backups retained for 1 year

**MongoDB Atlas Backup Configuration:**
- Point-in-time recovery enabled
- Backups stored in multiple regions
- Automated testing of backup integrity
- Oplog retention sufficient for point-in-time recovery

**Backup Security:**
- Encrypted backups using KMS
- Restricted access to backup retrieval
- Separate IAM role for backup operations
- Backup validation process with integrity checks

### File Storage Backups

**S3 Backup Strategy:**
- S3 versioning enabled for all buckets
- Cross-region replication for critical buckets
- S3 lifecycle policies to transition older versions to Glacier
- Retention policies aligned with compliance requirements

**Media and Static Assets:**
- Daily incremental backup of media files
- Full backup weekly
- External backup copy stored in separate AWS account
- Metadata backup synchronized with file backups

### Configuration Backups

**Infrastructure as Code:**
- All infrastructure defined with Terraform
- Terraform state files backed up and versioned
- Configuration stored in version control
- Regular validation of infrastructure against code

**Application Configuration:**
- Environment variables stored in Secrets Manager
- Configuration changes tracked with audit logs
- Configuration backups included in system backups
- Regular configuration validation testing

### Disaster Recovery

**Recovery Objectives:**
- Recovery Point Objective (RPO): 1 hour
- Recovery Time Objective (RTO): 4 hours
- Regular DR testing (quarterly)
- Documented recovery procedures

**DR Strategy:**
- Multi-region deployment capability
- Database replication across regions
- Regular DR drills with simulated failover
- Automated recovery scripts maintained and tested

**Recovery Process:**
1. Assess incident scope and impact
2. Initiate incident response team
3. Deploy infrastructure in secondary region
4. Restore data from backups or replicas
5. Verify application functionality
6. Redirect traffic to recovered environment
7. Validate success and document lessons learned

## Monitoring Setup

### Metrics Collection

**Key Metrics:**
- System metrics: CPU, memory, disk, network
- Application metrics: response time, error rate, request rate
- Business metrics: user activity, conversions, bookings
- Database metrics: query performance, connection count

**Collection Tools:**
- CloudWatch for infrastructure metrics
- Prometheus for application metrics
- Custom metrics published to CloudWatch
- Real User Monitoring (RUM) for frontend performance

### Alerting Configuration

**Alert Severity Levels:**
- Critical: Requires immediate action (24/7)
- High: Requires action within 1 hour
- Medium: Requires action within 1 business day
- Low: Informational, to be reviewed in regular intervals

**Alerting Rules:**
- Service availability < 99.9% (Critical)
- Error rate > 1% over 5 minutes (High)
- API latency > 500ms p95 (High)
- CPU utilization > 85% for 10 minutes (Medium)
- Disk usage > 80% (Medium)
- Failed backup jobs (High)

**Notification Channels:**
- PagerDuty for critical/high alerts
- Slack for all alert levels
- Email for medium/low alerts
- SMS for critical alerts only

### Log Management

**Log Sources:**
- Application logs
- Server logs
- Database logs
- Security logs
- Load balancer access logs

**Log Processing Pipeline:**
- CloudWatch Logs for collection
- Log subscription to Lambda for processing
- Structured logging format (JSON)
- PII scrubbing before storage
- Log retention: 30 days in hot storage, 1 year in cold storage

**Log Analysis:**
- CloudWatch Logs Insights for ad-hoc queries
- Regular log review process for security
- Automated anomaly detection
- Log correlation across services

## Performance Optimization

### Caching Strategy

**Multi-level Caching:**
- Browser caching with appropriate cache headers
- CDN caching for static assets and API responses
- Application-level caching with Redis
- Database query results caching

**Redis Configuration:**
- Separate Redis instances for different data types
- Memory allocation based on data priority
- Appropriate TTL settings per data type
- Eviction policy: volatile-lru

**Cache Invalidation:**
- Event-driven invalidation for data updates
- Time-based expiration for less critical data
- Version-based cache keys for static assets
- Selective cache purging capability

### CDN Configuration

**CloudFront Setup:**
- Multiple origin configurations (S3, ALB)
- Edge locations in all user regions
- Custom cache behaviors per path pattern
- HTTPS enforcement and modern TLS

**Cache Control:**
- S3 objects: Cache-Control max-age=31536000
- API responses: Cache-Control based on content type
- HTML: Cache-Control no-cache
- Images, CSS, JS: Cache-Control max-age=604800

**Security Settings:**
- Origin access identity for S3
- Field-level encryption for sensitive data
- Geo-restriction as needed
- WAF integration at edge

### Database Optimization

**Query Optimization:**
- Regular explain plan analysis
- Index coverage review
- Slow query logging and analysis
- Schema optimization for query patterns

**Connection Management:**
- Connection pooling configuration
- Monitoring connection usage
- Appropriate timeouts and retry logic
- Connection distribution across replicas

**Data Distribution:**
- Sharding strategy for horizontal scaling
- Data partitioning based on access patterns
- Read replicas for read-heavy workloads
- Archive strategy for historical data 