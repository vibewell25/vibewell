# Vibewell Dependency Management

This document outlines the tools and processes for managing dependencies in the Vibewell project.

## Automated Tools

### 1. Dependency Manager Script

We have a custom dependency management script that helps monitor and update dependencies:

```bash
node scripts/dependency-manager.js
```

This script provides a CLI interface with the following features:
- Check for outdated dependencies
- Check for security vulnerabilities
- Update dependencies at different levels (patch, minor, major)
- Generate comprehensive dependency reports

### 2. GitHub Actions Workflows

#### Security Audit
Automatically runs on a daily schedule and when dependency files change:
- Checks for security vulnerabilities
- Creates GitHub issues for critical vulnerabilities
- Uploads results to GitHub Security dashboard

#### Dependency Updates
Runs weekly and can be manually triggered:
- Automatically creates PRs for patch updates
- Creates issues with information about available major/minor updates

### 3. Dependabot

Configured to:
- Check for updates weekly
- Focus on security patches
- Create PRs for dependency updates
- Group related updates together

## Manual Update Process

### Patch Updates (Bug Fixes)

Safe to apply automatically:

```bash
# Root project
npm update

# Specific workspace
cd apps/web && npm update && cd ../..
```

### Minor Updates (New Features)

Requires testing but generally safe:

```bash
# Install npm-check-updates if not already installed
npm install -g npm-check-updates

# Update to latest minor versions
ncu -u --target minor
npm install
```

### Major Updates (Potential Breaking Changes)

Requires careful planning and testing:

1. Create a dedicated branch
2. Run updates for specific packages or groups
3. Test thoroughly
4. Document breaking changes and migration steps

```bash
# Example: Update a specific package
ncu -u -f "package-name"
npm install
```

## Best Practices

1. **Regular Updates**: Apply patch updates weekly and minor updates monthly
2. **Staged Approach**: Move from dev → staging → production
3. **Dependency Reviews**: Review all automated PRs before merging
4. **Testing**: Always run tests after dependency updates
5. **Documentation**: Document breaking changes and migrations

## Handling Deprecated Packages

When packages are deprecated:

1. Check for recommended replacements
2. Create a migration plan
3. Test compatibility
4. Update documentation

## Monitoring Dependencies

The project includes monitoring through:

1. **Weekly Reports**: Generated by GitHub Actions
2. **Security Alerts**: Via GitHub Security and Dependabot
3. **Dependency Dashboard**: Available in GitHub repository

## Troubleshooting

If you encounter issues with dependency updates:

1. Check the lock file for conflicts
2. Clear npm cache and node_modules
3. Update package managers
4. Check for peer dependency issues
5. Consult the dependency reports

For more information, contact the infrastructure team. 