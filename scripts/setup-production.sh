#!/bin/bash

# Vibewell Production Environment Setup Script
# This script implements the infrastructure and deployment architecture
# as described in docs/production-environment.md

echo "Setting up Vibewell Production Environment..."

# Create necessary directories
mkdir -p ./infrastructure/aws
mkdir -p ./infrastructure/terraform
mkdir -p ./infrastructure/scripts
mkdir -p ./deployment/config

# Setup Environment Variables template
cat > .env.production << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_SECONDARY_REGION=us-west-2
AWS_ACCOUNT_ID=your_account_id_here

# Terraform Configuration
TERRAFORM_STATE_BUCKET=vibewell-terraform-state
TERRAFORM_STATE_KEY=production/terraform.tfstate
TERRAFORM_STATE_REGION=us-east-1

# VPC Configuration
VPC_CIDR=10.0.0.0/16
PUBLIC_SUBNET_CIDRS=10.0.1.0/24,10.0.2.0/24,10.0.3.0/24
PRIVATE_SUBNET_CIDRS=10.0.4.0/24,10.0.5.0/24,10.0.6.0/24
DATABASE_SUBNET_CIDRS=10.0.7.0/24,10.0.8.0/24,10.0.9.0/24

# ECS Configuration
ECS_CLUSTER_NAME=vibewell-production
ECS_TASK_CPU=2048
ECS_TASK_MEMORY=4096
ECS_MIN_CAPACITY=3
ECS_MAX_CAPACITY=10
ECS_TASK_EXECUTION_ROLE=arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole

# Database Configuration
MONGODB_ATLAS_PROJECT_ID=your_atlas_project_id
MONGODB_ATLAS_CLUSTER_TIER=M30
MONGODB_BACKUP_RETENTION_DAYS=7

# Redis Configuration
REDIS_NODE_TYPE=cache.r6g.large
REDIS_NUM_SHARDS=2
REDIS_REPLICAS_PER_SHARD=2

# S3 Configuration
S3_BUCKET_PREFIX=vibewell-production
S3_VERSIONING=enabled
S3_LIFECYCLE_EXPIRATION_DAYS=365

# CloudFront Configuration
CLOUDFRONT_PRICE_CLASS=PriceClass_100
CLOUDFRONT_DEFAULT_TTL=86400
CLOUDFRONT_SSL_CERTIFICATE_ARN=your_certificate_arn
EOF

echo "Environment configuration template created: .env.production"

# Create Terraform main configuration
cat > ./infrastructure/terraform/main.tf << EOF
provider "aws" {
  region = var.aws_region
}

# Set up terraform backend (replace with your actual backend)
terraform {
  backend "s3" {
    bucket = "\${TERRAFORM_STATE_BUCKET}"
    key    = "\${TERRAFORM_STATE_KEY}"
    region = "\${TERRAFORM_STATE_REGION}"
    encrypt = true
  }
}

# Variables
variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment"
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for the database subnets"
  type        = list(string)
  default     = ["10.0.7.0/24", "10.0.8.0/24", "10.0.9.0/24"]
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  default     = "vibewell-production"
}

variable "container_insights" {
  description = "Whether to enable container insights"
  default     = true
}

variable "task_cpu" {
  description = "CPU units for the ECS task"
  default     = 2048
}

variable "task_memory" {
  description = "Memory for the ECS task in MiB"
  default     = 4096
}

variable "min_capacity" {
  description = "Minimum number of tasks"
  default     = 3
}

variable "max_capacity" {
  description = "Maximum number of tasks"
  default     = 10
}

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = "vibewell-vpc-\${var.environment}"
  cidr = var.vpc_cidr

  azs                 = ["$\{var.aws_region}a", "$\{var.aws_region}b", "$\{var.aws_region}c"]
  public_subnets      = var.public_subnet_cidrs
  private_subnets     = var.private_subnet_cidrs
  database_subnets    = var.database_subnet_cidrs

  enable_nat_gateway  = true
  single_nat_gateway  = false
  enable_vpn_gateway  = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = var.environment
    Application = "vibewell"
    Terraform   = "true"
  }
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "vibewell-alb-sg-\${var.environment}"
  description = "Security group for the application load balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vibewell-alb-sg-\${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "ecs_tasks_sg" {
  name        = "vibewell-ecs-tasks-sg-\${var.environment}"
  description = "Security group for the ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vibewell-ecs-tasks-sg-\${var.environment}"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = var.container_insights ? "enabled" : "disabled"
  }

  tags = {
    Environment = var.environment
    Application = "vibewell"
  }
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "vibewell-alb-\${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = true

  tags = {
    Environment = var.environment
    Application = "vibewell"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "vibewell-tg-\${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    matcher             = "200"
  }

  tags = {
    Environment = var.environment
    Application = "vibewell"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:us-east-1:123456789012:certificate/your-certificate-id"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  tags = {
    Environment = var.environment
    Application = "vibewell"
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = {
    Environment = var.environment
    Application = "vibewell"
  }
}

# Additional resources would be defined here (S3, CloudFront, ECS Services, Auto Scaling, etc.)
EOF

echo "Main Terraform configuration created"

# Create AWS CloudFormation template for ECS deployment
cat > ./infrastructure/aws/ecs-fargate.yaml << EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Vibewell ECS Fargate Service'

Parameters:
  Environment:
    Type: String
    Default: production
    Description: The environment name
    AllowedValues:
      - production
      - staging
      - development

  ServiceName:
    Type: String
    Default: vibewell-web
    Description: The name of the ECS service

  ClusterName:
    Type: String
    Default: vibewell-production
    Description: The name of the ECS cluster

  ContainerImage:
    Type: String
    Description: The container image to deploy (e.g., 123456789012.dkr.ecr.us-east-1.amazonaws.com/vibewell:latest)

  ContainerPort:
    Type: Number
    Default: 3000
    Description: The port the container exposes

  TaskCPU:
    Type: Number
    Default: 2048
    Description: CPU units for the task (1024 = 1 vCPU)

  TaskMemory:
    Type: Number
    Default: 4096
    Description: Memory for the task in MiB

  MinCapacity:
    Type: Number
    Default: 3
    Description: Minimum task count

  MaxCapacity:
    Type: Number
    Default: 10
    Description: Maximum task count

  VpcId:
    Type: AWS::EC2::VPC::Id
    Description: The VPC ID

  SubnetIds:
    Type: List<AWS::EC2::Subnet::Id>
    Description: List of private subnet IDs for the ECS service

  LoadBalancerTargetGroupArn:
    Type: String
    Description: The ARN of the ALB target group

  ServiceSecurityGroupId:
    Type: AWS::EC2::SecurityGroup::Id
    Description: The ID of the security group for the ECS service

Resources:
  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: !Ref ServiceName
      Cpu: !Ref TaskCPU
      Memory: !Ref TaskMemory
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ExecutionRoleArn: !Sub arn:aws:iam::$\{AWS::AccountId}:role/ecsTaskExecutionRole
      TaskRoleArn: !Sub arn:aws:iam::$\{AWS::AccountId}:role/vibewell-app-role
      ContainerDefinitions:
        - Name: !Ref ServiceName
          Image: !Ref ContainerImage
          Essential: true
          PortMappings:
            - ContainerPort: !Ref ContainerPort
              HostPort: !Ref ContainerPort
              Protocol: tcp
          Environment:
            - Name: NODE_ENV
              Value: production
            - Name: PORT
              Value: !Ref ContainerPort
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Sub /ecs/$\{ServiceName}
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs
          HealthCheck:
            Command:
              - CMD-SHELL
              - curl -f http://localhost:$\{PORT}/health || exit 1
            Interval: 30
            Timeout: 5
            Retries: 3
            StartPeriod: 60

  Service:
    Type: AWS::ECS::Service
    Properties:
      ServiceName: !Ref ServiceName
      Cluster: !Ref ClusterName
      TaskDefinition: !Ref TaskDefinition
      DeploymentConfiguration:
        MaximumPercent: 200
        MinimumHealthyPercent: 100
        DeploymentCircuitBreaker:
          Enable: true
          Rollback: true
      DesiredCount: !Ref MinCapacity
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          AssignPublicIp: DISABLED
          SecurityGroups:
            - !Ref ServiceSecurityGroupId
          Subnets: !Ref SubnetIds
      LoadBalancers:
        - ContainerName: !Ref ServiceName
          ContainerPort: !Ref ContainerPort
          TargetGroupArn: !Ref LoadBalancerTargetGroupArn
      HealthCheckGracePeriodSeconds: 120
      PropagateTags: SERVICE
      EnableECSManagedTags: true
      Tags:
        - Key: Environment
          Value: !Ref Environment
        - Key: Application
          Value: vibewell

  ScalableTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: !Ref MaxCapacity
      MinCapacity: !Ref MinCapacity
      ResourceId: !Join
        - /
        - - service
          - !Ref ClusterName
          - !GetAtt Service.Name
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs
      RoleARN: !Sub arn:aws:iam::$\{AWS::AccountId}:role/aws-service-role/ecs.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_ECSService

  ScalingPolicyCPU:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: !Sub $\{ServiceName}-cpu-scaling
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ScalableTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
        ScaleInCooldown: 300
        ScaleOutCooldown: 60

  ScalingPolicyMemory:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: !Sub $\{ServiceName}-memory-scaling
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ScalableTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageMemoryUtilization
        TargetValue: 70.0
        ScaleInCooldown: 300
        ScaleOutCooldown: 60

  LogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub /ecs/$\{ServiceName}
      RetentionInDays: 30

Outputs:
  ServiceName:
    Description: The name of the ECS service
    Value: !GetAtt Service.Name
  
  ServiceArn:
    Description: The ARN of the ECS service
    Value: !Ref Service
EOF

echo "ECS CloudFormation template created"

# Create a Docker Compose file for local development matching production
cat > ./deployment/config/docker-compose.yml << EOF
version: '3.8'

services:
  web:
    build:
      context: ../..
      dockerfile: Dockerfile
    image: vibewell-web
    container_name: vibewell-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s

  redis:
    image: redis:6-alpine
    container_name: vibewell-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

volumes:
  redis-data:
EOF

echo "Docker Compose configuration created"

# Create production Dockerfile example
cat > ./deployment/config/Dockerfile << EOF
# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:16-alpine AS runner

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV production

# Copy built files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
EOF

echo "Dockerfile created"

# Create AWS CLI script for S3 backup configuration
cat > ./infrastructure/scripts/configure-s3-backup.sh << EOF
#!/bin/bash

# Load environment variables
source .env.production

# Create S3 bucket for backups with versioning
aws s3api create-bucket \\
  --bucket ${S3_BUCKET_PREFIX}-backups \\
  --region ${AWS_REGION} \\
  --create-bucket-configuration LocationConstraint=${AWS_REGION}

# Enable versioning
aws s3api put-bucket-versioning \\
  --bucket ${S3_BUCKET_PREFIX}-backups \\
  --versioning-configuration Status=Enabled

# Configure lifecycle rules for backups
aws s3api put-bucket-lifecycle-configuration \\
  --bucket ${S3_BUCKET_PREFIX}-backups \\
  --lifecycle-configuration file://infrastructure/scripts/s3-lifecycle-config.json

# Encrypt bucket
aws s3api put-bucket-encryption \\
  --bucket ${S3_BUCKET_PREFIX}-backups \\
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

echo "S3 backup bucket configured"
EOF

chmod +x ./infrastructure/scripts/configure-s3-backup.sh

# Create S3 lifecycle configuration
cat > ./infrastructure/scripts/s3-lifecycle-config.json << EOF
{
  "Rules": [
    {
      "ID": "Move to Glacier after 30 days",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "ID": "Delete old logs",
      "Status": "Enabled",
      "Prefix": "logs/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

echo "S3 lifecycle configuration created"

# Create deployment script for production
cat > ./deployment/deploy-production.sh << EOF
#!/bin/bash

# Vibewell Production Deployment Script
# Usage: ./deploy-production.sh [version]

VERSION=\${1:-latest}
ACCOUNT_ID=\$(aws sts get-caller-identity --query Account --output text)
REGION=\$(aws configure get region)
IMAGE_NAME="vibewell-web"
ECR_REPO="\${ACCOUNT_ID}.dkr.ecr.\${REGION}.amazonaws.com/\${IMAGE_NAME}"

echo "Deploying version \${VERSION} to production..."

# Build and tag Docker image
echo "Building Docker image..."
docker build -t \${IMAGE_NAME}:\${VERSION} -f deployment/config/Dockerfile .
docker tag \${IMAGE_NAME}:\${VERSION} \${ECR_REPO}:\${VERSION}
docker tag \${IMAGE_NAME}:\${VERSION} \${ECR_REPO}:latest

# Log in to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region \${REGION} | docker login --username AWS --password-stdin \${ACCOUNT_ID}.dkr.ecr.\${REGION}.amazonaws.com

# Push image to ECR
echo "Pushing image to ECR..."
docker push \${ECR_REPO}:\${VERSION}
docker push \${ECR_REPO}:latest

# Update ECS service
echo "Updating ECS service..."
aws ecs update-service \\
  --cluster vibewell-production \\
  --service vibewell-web \\
  --force-new-deployment \\
  --region \${REGION}

echo "Deployment initiated. Monitor status with:"
echo "aws ecs describe-services --cluster vibewell-production --services vibewell-web --region \${REGION}"
EOF

chmod +x ./deployment/deploy-production.sh

# Create a simple README for the production setup
cat > ./infrastructure/README.md << EOF
# Vibewell Production Infrastructure

This directory contains configuration files and scripts for setting up and managing the Vibewell production environment.

## Components

- **AWS Infrastructure**: Terraform and CloudFormation templates for provisioning resources
- **Deployment Scripts**: Scripts for automating the deployment process
- **Configuration Templates**: Configuration files for services and containers
- **Backup Scripts**: Scripts for configuring and managing backups

## Setup Instructions

1. Update the environment variables in \`.env.production\`
2. Initialize Terraform:
   \`\`\`
   cd infrastructure/terraform
   terraform init
   \`\`\`
3. Apply Terraform configuration:
   \`\`\`
   terraform apply
   \`\`\`
4. Configure backups:
   \`\`\`
   ./infrastructure/scripts/configure-s3-backup.sh
   \`\`\`

## Deployment

To deploy a new version to production:

\`\`\`
./deployment/deploy-production.sh [version]
\`\`\`

## Architecture

The production environment uses the following AWS services:

- **Compute**: ECS Fargate for containerized applications
- **Networking**: VPC with public and private subnets, ALB for load balancing
- **Storage**: S3 for files, MongoDB Atlas for database
- **Caching**: ElastiCache Redis for caching
- **CDN**: CloudFront for content delivery

## Security

The infrastructure implements security best practices:
- Private subnets for application containers
- Security groups with principle of least privilege
- Encryption for data at rest and in transit
- IAM roles with fine-grained permissions
- WAF for protecting public endpoints

## Monitoring

Refer to the monitoring setup in \`/monitoring\` for details on metrics, logging, and alerting.

## Contact

For questions or issues, contact the DevOps team.
EOF

echo "Production environment setup script completed!"
echo "The implementation includes:"
echo "- AWS infrastructure templates (Terraform, CloudFormation)"
echo "- Docker configuration for containerization"
echo "- ECS service configuration"
echo "- Networking and security setup"
echo "- Backup strategies for S3"
echo "- Deployment automation scripts"
echo ""
echo "To set up the production environment, update the .env.production file with your actual values,"
echo "then apply the Terraform configuration and deploy using the provided scripts."

# Make the script executable
chmod +x scripts/setup-production.sh 