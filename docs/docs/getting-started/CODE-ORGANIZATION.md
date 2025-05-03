# Code Organization

Follow these best practices to keep your codebase clear, scalable, and maintainable:

## 1. Directory Structure

- **Feature-Based Organization**: Group files by feature or domain (e.g., `auth/`, `booking/`, `payments/`).
- **Layered Folders**: Within each feature, separate by layers: `components/`, `services/`, `models/`, `hooks/`, `tests/`, etc.
- **Shared Libraries**: Centralize cross-cutting code (utilities, constants, types) under `libs/` or `shared/`.
- **Entrypoints**: Keep a top-level `index.ts` or `main.ts` to bootstrap your application.

## 2. Naming Conventions

- **Files**: use `kebab-case` for filenames (e.g., `user-profile.tsx`, `api-client.ts`).
- **Directories**: use `kebab-case` or `camelCase` consistently (e.g., `auth-service/`).
- **Components**: use `PascalCase` for React components (e.g., `UserCard.tsx`).
- **Types/Interfaces**: prefix with `I` or `T` if needed (e.g., `IUser`, `TBookingParams`), but prefer concise names.

## 3. Barrel Files & Exports

- **Index Files**: Use `index.ts` at module roots to re-export public APIs. Example:
  ```ts
  // components/index.ts
  export { default as Button } from './Button';
  export { default as Modal } from './Modal';
  ```
- **Avoid Large Barrels**: Limit barrel files to a single feature scope to prevent circular dependencies and large bundles.

## 4. Co-Locate Tests

- Place unit or integration tests next to the code under test with `.test.ts` or `.spec.ts` naming. E.g., `user-service.test.ts`.
- For React components, use `.test.tsx` in the same component folder.

## 5. Configuration & Scripts

- **Configs**: Keep tooling config files (`.eslintrc`, `tsconfig.json`, `jest.config.js`) at repo root.
- **Environment**: Use a single `env/` or `.env.*` pattern for environment variables, and load via a central config loader.
- **Scripts**: Put automation scripts in `scripts/` (e.g., `scripts/generate-types.ts`, `scripts/deploy.ts`).

## 6. Documentation

- Include a `README.md` in each major folder describing its purpose, public APIs, and usage examples.
- Update the central docs to reference module boundaries and code organization guidelines.

## 7. Separation of Concerns

- Avoid mixing UI and business logic in the same file—extract hooks or services for logic.
- Keep styling (CSS/SCSS/Styled Components) in close proximity to the component, but separated (e.g., `*.styles.ts`).

## 8. Dependency Management

- Limit direct imports between feature modules—use public APIs or service interfaces.
- Manage shared dependencies (e.g., Axios instance, database client) via a single module to control updates.

---
_Consistent code organization improves onboarding, enhances readability, and reduces maintenance overhead._ 