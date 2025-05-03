# Code Review Guidelines

This guide outlines best practices, checklists, and etiquette for conducting effective code reviews that improve quality, share knowledge, and ensure consistency.

## 1. Objectives of a Review
- **Code Quality**: Catch bugs, enforce coding standards, and maintainable patterns.
- **Knowledge Sharing**: Spread context and understanding across the team.
- **Consistency**: Ensure uniform style, architecture, and patterns.
- **Security & Compliance**: Identify security risks, data handling, and compliance issues.
- **Performance & Scalability**: Spot potential bottlenecks or suboptimal resource usage.

## 2. Review Process
1. **Author Self-Review**: Author runs linters, unit tests, and does a personal walkthrough before creating a PR.
2. **PR Creation**: Use a clear title and description. Link relevant issue(s) and include a summary of changes.
3. **Assign Reviewers**: Select 1–2 domain experts or rotating reviewers.
4. **CI Validation**: Ensure automated checks pass (lint, type checks, tests, accessibility, security scans).
5. **Review Feedback**: Reviewers provide inline comments, label critical vs. minor issues, and approve once resolved.
6. **Merge Strategy**: After required approvals, merge with squash or merge commit per policy and delete the feature branch.

## 3. Review Checklist
- **Functionality**: Does the code do what it intends? Are all edge cases handled?
- **Readability**: Are variable names, comments, and abstractions clear?
- **Tests**: Are there adequate unit/integration tests? Do they cover new logic and edge cases?
- **Performance**: Any potential slow paths, memory leaks, or heavy operations?
- **Security**: Input validation, proper escaping/sanitization, no secrets in code, correct authorization checks.
- **Error Handling**: Are errors caught and communicated properly? No unhandled promises.
- **Accessibility**: Ensure UI changes include ARIA attributes, focus management, and color contrast.
- **Documentation**: Update relevant docs, README, or inline comments if APIs or usage change.
- **Backward Compatibility**: Check API versioning, data migrations, and consumer impact.

## 4. Feedback Etiquette
- Be **constructive** and **specific**: Suggest alternatives, not just problems.
- Keep it **objective**: Focus on code, not the author.
- Use **positive language**: ‘Consider refactoring X to…’ vs. ‘You did X wrong.’
- Encourage **discussion**: Ask ‘What do you think about…?’ to find better solutions.

## 5. Tools & Automation
- **PR Templates**: Enforce standard PR fields (description, testing steps, screenshot links).
- **Linters**: ESLint, Stylelint, markdownlint integrated in CI.
- **Type Checking**: Run TypeScript compiler in CI.
- **Security Scanners**: Snyk, Dependabot, or custom OWASP scripts.
- **Coverage Reports**: Fail builds below target coverage thresholds.

---
_Consistent, thoughtful code reviews are key to a healthy, high‐trust engineering culture._ 