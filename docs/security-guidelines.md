# Security Guidelines for Secret Management

## Overview

This document outlines best practices for handling sensitive information such as API keys, passwords, and other credentials within the Vibewell platform development workflow.

## Secret Management Principles

1. **No hardcoded secrets**: Never commit real secrets directly into the source code.
2. **Separation of concerns**: Keep configuration separate from application code.
3. **Least privilege**: Limit access to secrets to only those who need them.
4. **Rotation**: Regularly rotate secrets to reduce the impact of potential leaks.
5. **Audit trail**: Maintain a record of access to secrets.

## Environment Variables

### Development Environment

1. **Local development**:
   - Use `.env.local` for local development and ensure it's added to `.gitignore`.
   - Copy `.env.local.example` to `.env.local` and add your actual values.
   - Never commit `.env.local` files to the repository.

2. **Test environment**:
   - Use `.env.test` with non-sensitive placeholders for tests.
   - Replace actual credentials with test tokens and placeholders.

### Production Environment

1. **CI/CD pipeline**:
   - Store secrets as protected environment variables in GitHub Actions.
   - Use GitHub Secrets for sensitive values referenced in workflows.

2. **Deployment**:
   - Use AWS Secrets Manager or similar services for storing production secrets.
   - Reference secrets in environment variables or configuration files at deployment time.

## Handling Specific Types of Secrets

### API Keys

- Store API keys in environment variables.
- Use different API keys for development, testing, and production environments.
- Create keys with appropriate scopes and permissions.

### Database Credentials

- Use different credentials for different environments.
- Restrict database user permissions based on the application's needs.
- Consider using IAM-based authentication for AWS services where possible.

### JWT Tokens

- Never hardcode JWT tokens or secrets.
- Ensure proper expiration times on tokens.
- Use strong secrets for signing tokens.

## Tools and Services

1. **Secrets Management**:
   - AWS Secrets Manager
   - GitHub Secrets
   - HashiCorp Vault

2. **Environment Variable Management**:
   - dotenv (for local development)
   - AWS Parameter Store (for production configuration)

## Implementation Guidelines

### Code Review Checklist

During code reviews, check for:
- Hardcoded secrets or credentials
- Inappropriate logging of sensitive information
- Missing or incomplete environment variable validation

### Testing

- Use mock or fake values for secrets in tests
- Ensure tests can run without access to production credentials

### Documentation

- Document required environment variables in README files
- Provide clear instructions for development setup
- Use placeholders or examples in documentation, never real values

## Incident Response

If a secret is accidentally committed to the repository:

1. Immediately rotate the exposed credential
2. Remove the secret from the Git history (contact DevOps team for assistance)
3. Document the incident and take preventive measures

## Contact Information

For questions about secret management or to report security concerns, contact:
- Security Team: security@vibewell.com
- DevOps Team: devops@vibewell.com 