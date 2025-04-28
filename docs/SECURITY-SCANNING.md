# Security Scanning for Vibewell

This document outlines the security scanning infrastructure set up for the Vibewell project.

## Automated Security Scanning

Security scanning is automated in our CI/CD pipeline and includes the following checks:

### 1. NPM Audit

Checks for known vulnerabilities in our dependencies:

```
npm run security:audit
```

### 2. ESLint Security Rules

Performs static code analysis to detect common security issues:

```
npm run security:eslint
```

### 3. Snyk Vulnerability Scanning

Performs deeper security analysis and vulnerability detection:

```
npm run security:scan
```

### 4. Run All Security Checks

```
npm run security:all
```

## Security Middleware

The application uses security middleware located at `src/middleware/security.ts` which provides:

- Content Security Policy (CSP) headers
- Protection against XSS attacks
- Rate limiting
- Prevention of clickjacking
- MIME type sniffing protection

## GitHub Actions Integration

Security scans run automatically:
- On pushes to main/develop branches
- On pull requests to main/develop
- On a weekly schedule

## Handling Security Issues

When security vulnerabilities are detected:

1. Critical/High severity issues must be fixed immediately
2. Medium severity issues should be addressed in the next sprint
3. Low severity issues should be evaluated and prioritized

## Best Practices

- Never commit secrets or credentials to the repository
- Always validate user input
- Follow the principle of least privilege
- Keep dependencies updated
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
