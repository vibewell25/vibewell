# VibeWell Git Workflow Guide

This document outlines our Git workflow and branching strategy to ensure clean version control and consistent collaboration on the VibeWell platform.

## Branching Strategy

We follow a GitFlow-inspired branching strategy with the following branches:

### Core Branches

- **main**: The production branch containing the code currently in production. All code in this branch should be stable and production-ready.
- **develop**: The main development branch where all feature branches are eventually merged. This branch serves as the integration branch for features.

### Support Branches

- **feature/**: Feature branches are created from `develop` and are used to develop new features or enhancements. They are merged back into `develop` when completed.
  - Naming convention: `feature/feature-name` or `feature/VW-123-feature-name` (where VW-123 is the JIRA ticket number)
- **bugfix/**: Bug fix branches are created from `develop` to fix bugs that are not critical and can wait for the next release.
  - Naming convention: `bugfix/bug-description` or `bugfix/VW-123-bug-description`
- **hotfix/**: Hotfix branches are created from `main` to fix critical bugs in production. They are merged into both `main` and `develop`.
  - Naming convention: `hotfix/bug-description` or `hotfix/VW-123-bug-description`
- **release/**: Release branches are created from `develop` when a set of features is ready to be released. They are merged into `main` when ready.
  - Naming convention: `release/vX.Y.Z` (where X.Y.Z is the version number)

## Workflow Process

### Starting a New Feature

1. Ensure your local `develop` branch is up to date:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create a new feature branch:
   ```bash
   git checkout -b feature/feature-name
   ```

3. Implement your feature with regular commits following our commit message guidelines.

4. Periodically rebase your feature branch with the latest changes from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/feature-name
   git rebase develop
   ```

5. When the feature is complete, push your branch to the remote repository:
   ```bash
   git push origin feature/feature-name
   ```

6. Create a pull request (PR) from your feature branch to `develop`.

### Code Review Process

1. All PRs must have at least one approval from a team member before merging.
2. CI checks must pass (linting, tests, build).
3. Code must follow our coding standards and style guidelines.
4. Feature implementation must meet the requirements specified in the ticket.

### Merging to Develop

After PR approval:

1. Ensure your branch is up to date with the latest changes in `develop`:
   ```bash
   git checkout feature/feature-name
   git pull origin develop
   git rebase develop
   ```

2. Resolve any conflicts that arise during rebasing.

3. Push your updated branch (force push may be needed after rebasing):
   ```bash
   git push --force-with-lease origin feature/feature-name
   ```

4. Merge your PR to `develop` using the "Squash and Merge" option.

### Creating a Release

1. Create a release branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. Fix any last-minute bugs directly in the release branch.

3. Update version numbers and CHANGELOG.md.

4. When the release branch is stable, create a PR to merge it into `main`.

5. After merging to `main`, create a PR to merge the same release branch into `develop` to ensure any release fixes are included.

6. Tag the release in `main`:
   ```bash
   git checkout main
   git pull origin main
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   git push origin vX.Y.Z
   ```

### Handling Hotfixes

1. Create a hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. Fix the bug and commit the changes.

3. Create a PR to merge the hotfix into `main`.

4. After merging to `main`, create another PR to merge the same hotfix into `develop`.

5. Tag the hotfix in `main` with an incremented patch version:
   ```bash
   git checkout main
   git pull origin main
   git tag -a vX.Y.(Z+1) -m "Version X.Y.(Z+1)"
   git push origin vX.Y.(Z+1)
   ```

## Commit Message Guidelines

We follow the Conventional Commits specification for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(auth): add login form validation

Add client-side validation for the login form to improve user experience.

Closes #123
```

```
fix(payment): resolve calculation error in checkout

The calculation was incorrectly rounding down instead of to the nearest cent.

Fixes VW-456
```

## Best Practices

1. **Keep branches short-lived**: Feature branches should not live for more than a few days to avoid merge conflicts.

2. **Commit frequently**: Make small, focused commits rather than large, monolithic ones.

3. **Write descriptive commit messages**: Follow our commit message guidelines to ensure meaningful history.

4. **Rebase instead of merge**: Use `git rebase` to keep branches up to date with `develop` for a cleaner history.

5. **Delete branches after merging**: Keep the repository clean by deleting branches once they're merged.

6. **Don't force push to shared branches**: Never force push to `main` or `develop` branches.

7. **Review your changes before committing**: Use `git diff` or `git status` to review your changes before committing.

8. **Use pull request templates**: Follow the provided PR template to ensure all required information is included.

By following these guidelines, we can maintain a clean, understandable Git history and make collaboration smoother for everyone on the team. 