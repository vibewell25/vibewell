# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[security@vibewell.com](mailto:security@vibewell.com)**. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Measures

This project implements several security measures:

### Automated Security Checks
- Weekly Dependabot scans for vulnerable dependencies
- Automated security testing on all PRs
- OWASP Dependency-Check for known vulnerabilities
- Snyk security scanning
- Trivy vulnerability scanner for both code and Docker images

### Development Practices
- All dependencies are automatically updated through Dependabot
- Security updates are prioritized and reviewed promptly
- Code is regularly audited for security issues
- We follow secure coding practices and OWASP guidelines

### Third-Party Dependencies
- All dependencies are monitored for security updates
- Dependencies are grouped and updated systematically
- Major version updates are carefully reviewed to prevent breaking changes

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all still-maintained versions.
4. Release new versions and update the changelog.

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request. 