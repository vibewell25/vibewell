# VibeWell Production Environment

This document describes the production environment setup for the VibeWell application, including infrastructure, security measures, and operational procedures.

## Infrastructure

### Hosting Environment

The VibeWell application is deployed in a production environment with the following components:

- **Web Application Server**: Node.js application running on Docker containers
- **Reverse Proxy**: Nginx for handling request routing, SSL termination, and rate limiting
- **Database**: Supabase (PostgreSQL)
- **Redis**: For rate limiting, caching, and session management
- **SSL**: Let's Encrypt certificates with automatic renewal

### Architecture

```
                   +----------------+
                   |                |
   +-------------> |  Load Balancer |
                   |                |
                   +-------+--------+
                           |
                           v
                   +-------+--------+
                   |                |
                   |  NGINX Proxy   |
                   |   (SSL, WAF)   |
                   |                |
                   +-------+--------+
                           |
           +--------------+--------------+
           |              |              |
           v              v              v
  +----------------+ +----------+ +-------------+
  |                | |          | |             |
  | Web App Nodes  | |  Admin   | |  API Nodes  |
  | (Next.js)      | |  Panel   | |             |
  |                | |          | |             |
  +-------+--------+ +-----+----+ +------+------+
          |                |             |
          |                |             |
          v                v             v
  +-------+----------------+-------------+------+
  |                                             |
  |                  Redis                      |
  |   (Rate Limiting, Caching, WebSockets)      |
  |                                             |
  +---------------------+---------------------+-+
                        |
                        v
  +---------------------+----------------------+
  |                                            |
  |                  Supabase                  |
  |                 (PostgreSQL)               |
  |                                            |
  +--------------------------------------------+
```

## Deployment Process

### Deployment Steps

1. Build the application using CI/CD pipeline
2. Run automated tests (unit, integration, security)
3. Create Docker image with the application
4. Deploy to production environment using blue/green deployment
5. Run smoke tests to verify deployment
6. Switch traffic to new deployment if tests pass

### Rollback Procedure

In case of deployment issues:

1. Identify the issue through monitoring alerts or manual verification
2. Execute the rollback command to revert to the previous stable version
3. Verify the rollback was successful
4. Analyze root cause of the deployment issue

## Security Measures

### Network Security

- All external traffic is routed through the load balancer
- Web Application Firewall (WAF) rules to prevent common attacks
- Rate limiting applied at the Nginx layer and application layer
- IP-based restriction for administrative endpoints

### Data Protection

- All data in transit is encrypted using TLS 1.3
- Database data at rest is encrypted
- Regular security audits and penetration testing
- Adherence to data protection regulations (GDPR, CCPA)

### Access Control

- Role-based access control (RBAC) for application users
- Multi-factor authentication for administrative access
- Least privilege principle for service accounts
- Regular access review and rotation of credentials

## Rate Limiting Configuration

Rate limiting is implemented at multiple levels:

### Nginx Rate Limiting

Configured in Nginx to provide the first line of defense:

```
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
```

### Application Rate Limiting

Redis-backed rate limiting for specific endpoints:

| Endpoint Type | Request Limit | Time Window | Notes |
|---------------|--------------|-------------|-------|
| Default       | 60 requests  | 60 seconds  | General API endpoints |
| Authentication| 10 requests  | 15 minutes  | Login, password reset |
| Sensitive     | 30 requests  | 60 minutes  | Financial operations |
| Admin         | 120 requests | 60 seconds  | Admin panel operations |

## Monitoring and Logging

### Monitoring Stack

- Application performance monitoring
- Server metrics collection
- Real-time alerting for critical issues
- Uptime monitoring for external services

### Logging

- Centralized logging solution
- Log retention policy (90 days online, 1 year archived)
- Structured logging format for easier querying
- Automated log analysis for security events

### Key Metrics

- Response time by endpoint
- Error rates and status codes
- Rate limit triggers and blocks
- Authentication successes and failures
- Database query performance

## Disaster Recovery

### Backup Strategy

- Automated daily database backups
- Weekly full system backups
- Backup verification process
- Cross-region backup replication

### Recovery Procedures

1. Identify the scope of the incident
2. Activate the disaster recovery team
3. Restore from backups if needed
4. Verify data integrity
5. Switch traffic to recovered systems

### Recovery Time Objectives

- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours

## Environment Variables

The production environment requires the following environment variables:

```
# Node environment
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=<secure-password>
REDIS_TLS=true
REDIS_TIMEOUT=5000

# Rate Limiting Configuration
RATE_LIMIT_DEFAULT_MAX=60
RATE_LIMIT_DEFAULT_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_SENSITIVE_MAX=30
RATE_LIMIT_SENSITIVE_WINDOW_MS=3600000

# Security Settings
SECURITY_ENABLE_RATE_LIMITING=true
SECURITY_LOG_RATE_LIMIT_EVENTS=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

## Maintenance Procedures

### Regular Maintenance

- Security patches within 24 hours of release
- Weekly non-critical updates
- Monthly package dependency reviews
- Quarterly infrastructure review

### Scaling Procedures

- Horizontal scaling of web and API nodes based on load
- Database read replica scaling for heavy read operations
- Redis cluster expansion for increased caching needs

## Troubleshooting

### Common Issues

1. **Rate limiting issues**: Check Redis connection and rate limit configuration
2. **SSL certificate problems**: Verify Let's Encrypt renewal process
3. **Database connection errors**: Check Supabase status and connection strings
4. **High server load**: Analyze metrics to identify bottlenecks

### Support Contacts

- Technical Support: tech-support@vibewell.example.com
- Emergency Contact: on-call@vibewell.example.com
- Security Issues: security@vibewell.example.com

## Compliance

The production environment is designed to comply with:

- GDPR data protection requirements
- CCPA privacy regulations
- OWASP security best practices
- Industry standard availability requirements (99.9% uptime)

## Setup Instructions

The production environment can be set up using the provided script:

```bash
sudo ./scripts/setup-production.sh
```

See the script comments for detailed information on each setup step. 