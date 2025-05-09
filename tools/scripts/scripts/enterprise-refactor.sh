#!/usr/bin/env bash
# Exit immediately on errors for long-term fixes
set -euo pipefail

ROOT_DIR="$(pwd)"

echo "Starting enterprise-grade refactoring..."

# Prepare legacy-review directories
mkdir -p legacy-review/services legacy-review/components legacy-review/utils

# Move src/pages directory to legacy-review to avoid conflict with app router
if [[ -d "src/pages" ]]; then
  echo "Moving Next.js 'src/pages' directory to legacy-review/src/pages"
  mkdir -p legacy-review/src
  git mv src/pages legacy-review/src/pages
fi

# Move ESLint flat config out to legacy-review to fallback to .eslintrc.json
if [[ -f "eslint.config.mjs" ]]; then
  echo "Moving eslint.config.mjs to legacy-review"
  git mv eslint.config.mjs legacy-review/
fi

echo "=== Step 1: Consolidate duplicates in services ==="
find src/services -type f \( -name "*.ts" -o -name "*.tsx" \) | sed 's!.*/!!' | tr '[:upper:]' '[:lower:]' | sort | uniq -d | while IFS= read -r basename_lower; do
  echo "Processing duplicate basename: $basename_lower"
  # Collect all matching files
  matches=( $(find src/services -type f -iname "$basename_lower" 2>/dev/null) )
  # Pick the first as canonical
  canonical=""
  [[ ${#matches[@]} -gt 0 ]] && canonical="${matches[0]}"
  for m in "${matches[@]}"; do
    if [[ "$m" != "$canonical" ]]; then
      target="legacy-review/services/$(basename "$m")"
      if [[ ! -e "$target" ]]; then
        echo "Moving $m to $target"
        if git ls-files --error-unmatch "$m" >/dev/null 2>&1; then
          git mv "$m" "$target"
        else
          mv "$m" "$target"
          git add "$target"
        fi
      else
        echo "Skipping moving $m to $target because target already exists"
      fi
    fi
  done
done

echo "=== Step 1b: Consolidate duplicates in components ==="
find src/components -type f \( -name "*.ts" -o -name "*.tsx" \) | sed 's!.*/!!' | tr '[:upper:]' '[:lower:]' | sort | uniq -d | while IFS= read -r basename_lower; do
  echo "Processing duplicate component basename: $basename_lower"
  matches=( $(find src/components -type f -iname "$basename_lower" 2>/dev/null) )
  canonical=""
  [[ ${#matches[@]} -gt 0 ]] && canonical="${matches[0]}"
  for m in "${matches[@]}"; do
    if [[ "$m" != "$canonical" ]]; then
      target="legacy-review/components/$(basename "$m")"
      if [[ ! -e "$target" ]]; then
        echo "Moving $m to $target"
        if git ls-files --error-unmatch "$m" >/dev/null 2>&1; then
          git mv "$m" "$target"
        else
          mv "$m" "$target"
          git add "$target"
        fi
      else
        echo "Skipping moving $m to $target because target already exists"
      fi
    fi
  done
done

echo "=== Step 1c: Consolidate duplicates in utils ==="
find src/utils -type f \( -name "*.ts" -o -name "*.tsx" \) | sed 's!.*/!!' | tr '[:upper:]' '[:lower:]' | sort | uniq -d | while IFS= read -r basename_lower; do
  echo "Processing duplicate util basename: $basename_lower"
  matches=( $(find src/utils -type f -iname "$basename_lower" 2>/dev/null) )
  canonical=""
  [[ ${#matches[@]} -gt 0 ]] && canonical="${matches[0]}"
  for m in "${matches[@]}"; do
    if [[ "$m" != "$canonical" ]]; then
      target="legacy-review/utils/$(basename "$m")"
      if [[ ! -e "$target" ]]; then
        echo "Moving $m to $target"
        if git ls-files --error-unmatch "$m" >/dev/null 2>&1; then
          git mv "$m" "$target"
        else
          mv "$m" "$target"
          git add "$target"
        fi
      else
        echo "Skipping moving $m to $target because target already exists"
      fi
    fi
  done
done

echo "=== Step 2: Normalize filenames to kebab-case ==="
for DIR in src/services src/components src/utils; do
  echo "--- Renaming CamelCase files in $DIR ---"
  find "$DIR" -type f \( -name "*[A-Z]*.ts" -o -name "*[A-Z]*.tsx" \) | while read -r f; do
    # Skip if file no longer exists
    if [[ ! -e "$f" ]]; then
      continue
    fi
    dirp="$(dirname "$f")"
    ext="${f##*.}"
    base="$(basename "$f" ."$ext")"
    newbase="$(echo "$base" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')"
    newpath="$dirp/$newbase.$ext"
    if [[ "$f" != "$newpath" ]]; then
      echo "Renaming $f -> $newpath"
      # ensure destination directory exists
      mkdir -p "$(dirname "$newpath")"
      if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
        git mv "$f" "$newpath"
      else
        mv "$f" "$newpath"
        git add "$newpath"
      fi
    else
      echo "Skipping rename for $f (already kebab-case)"
    fi
  done
done

# Step 3: Update import paths via jscodeshift codemod
echo "=== Step 3: Updating import paths to kebab-case filenames via codemod ==="
npx jscodeshift -t scripts/update-import-paths.js src --extensions=ts,tsx --parser=ts

echo "=== Step 4: Validate project integrity ==="
npm run type-check
npm run lint
npm run build

# Final commit
echo "=== Step 5: Commit all changes ==="
git add .
git commit -m "refactor: updated import paths via codemod and normalized file naming to kebab-case; moved legacy modules to legacy-review"

echo "Enterprise-grade refactoring complete." 