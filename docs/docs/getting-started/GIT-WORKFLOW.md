# Git Workflow

This guide outlines our standardized Git workflow, covering branching models, commit conventions, pull request reviews, and release processes.

## 1. Branching Model
- **`main` (or `master`)**: Always contains production-ready code. Protected branch requiring PR reviews.
- **`develop`**: Integration branch for features; updated via pull requests and used for QA/staging.
- **`feature/{name}`**: Created off `develop` for new features or enhancements. Delete after merge.
- **`release/{version}`**: Branched from `develop` when preparing a release. Allows final testing and fixes, then merged into `main` and `develop`.
- **`hotfix/{name}`**: Branched from `main` for urgent fixes. After validation, merge back into both `main` and `develop`.

## 2. Commit Message Conventions
Adopt **Conventional Commits** for clarity and automated changelogs:
- **`feat:`** A new feature
- **`fix:`** A bug fix
- **`docs:`** Documentation only changes
- **`chore:`** Changes to build process or tooling
- **`refactor:`** Code change that neither fixes a bug nor adds a feature
- **`test:`** Adding or correcting tests

**Example**: `feat(auth): add OAuth2 support for Google login`

## 3. Pull Request Reviews
- Create a pull request (PR) targeting the appropriate base (`develop` or `main`).
- Assign reviewers and add relevant labels (e.g., `feature`, `bug`, `hotfix`).
- Ensure CI checks (lint, tests, accessibility, security) all pass before merging.
- Reviewers should verify:
  - Code correctness and logic
  - Adherence to style guides and lint rules
  - Adequate test coverage and documentation
  - No sensitive data or secrets are exposed
- After approvals (minimum 2), merge with **squash** or **merge commit** according to project policy.

Coming soon: guidelines on branching strategies, commit conventions, pull request reviews, and release workflows. 