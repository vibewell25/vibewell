#!/usr/bin/env bash
set -euo pipefail

# This script reorganizes markdown files for the Docusaurus site into category subfolders
# Run this from the repository root: bash scripts/reorganize-docs.sh

# Determine script and repo root directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
DOCS_CONTENT="$REPO_ROOT/docs/docs"

# Ensure working dir exists
if [ ! -d "$DOCS_CONTENT" ]; then
  echo "Error: $DOCS_CONTENT not found"
  exit 1
fi

cd "$DOCS_CONTENT"

echo "Creating category folders..."
for dir in getting-started user-guide guides api architecture components testing security deployment migration troubleshooting; do
  mkdir -p "$dir"
done

echo "Moving core Getting Started docs..."
mv SETUP.md DEVELOPMENT-SETUP.md SERVICE-SETUP-GUIDE.md index.md getting-started/ || true

echo "Moving User & Developer Guides into 'user-guide' category..."
mv user-guide.md developer-guide.md user-guide/ || true

echo "Moving API docs..."
mv API.md api-documentation-guide.md openapi.yaml server.md api/ || true

echo "Moving Architecture docs..."
mv TECHNICAL.md ARCHITECTURE-EVALUATION-PLAN.md system-architecture.md architecture/ || true

echo "Moving Component docs..."
mv component-template.md component-documentation.md src-components-ui.md src-contexts.md src-utils.md type-guards.md components/ || true

echo "Moving Testing docs..."
mv TESTING.md tests.md tests-rate-limiting.md tests-post-deploy.md tests-k6.md tests-factories.md K6-TESTING.md testing/ || true

echo "Moving Security docs..."
mv SECURITY-BEST-PRACTICES.md SECURITY_IMPLEMENTATION.md privacy-policy.md legal-requirements-review.md security/ || true

echo "Moving Deployment docs..."
mv DEPLOYMENT.md deployment-guide.md DATABASE-GUIDE.md backup-system.md ENVIRONMENT.md production-environment.md ci-cd-integration.md BUILD-STATUS.md deployment/ || true

echo "Moving Migration docs..."
mv MIGRATION-GUIDE.md rate-limiter-migration.md rate-limiting-guide.md migration/ || true

echo "Moving Troubleshooting docs..."
mv getting-started/troubleshooting-guide.md troubleshooting/ || true

echo "Moving User & Developer Guides into 'user-guide' folder..."
mkdir -p user-guide
mv guides/user-guide.md user-guide/index.md || true
mv guides/developer-guide.md user-guide/developer-guide.md || true
rm -f guides/user-guide.md guides/developer-guide.md || true

echo "Moving all remaining markdown into Guides..."
# Move any markdown files not in subdirs
for f in *.md; do
  mv "$f" guides/ || true
done

echo "Cleaning up outdated folders..."
rm -rf user-guides utilities || true

# Move LICENSE.md to top-level docs folder
if [ -f LICENSE.md ]; then
  mv LICENSE.md ../../
fi

echo "Reorganization complete." 