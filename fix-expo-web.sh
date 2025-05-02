#!/bin/bash

echo "🔧 Fixing Expo Web Build Environment..."

# Step 0: Ensure Node.js is installed
echo "📦 Checking for Node.js..."
if ! command -v node &> /dev/null; then
  echo "❗ Node.js not found. Please install Node.js (>=18 <=21) via Volta, Homebrew, or the official installer."
  exit 1
fi

# Step 1: Ensure Node version is within supported range
echo "📦 Checking Node.js version..."
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if (( NODE_MAJOR < 18 || NODE_MAJOR > 21 )); then
  echo "❗ Unsupported Node version $(node -v). Please use Node >=18 <=21."
  exit 1
fi

# Step 2: Clean old installs
echo "🧹 Cleaning root and mobile dependencies..."
rm -rf node_modules package-lock.json .npmrc
cd mobile && rm -rf node_modules package-lock.json && cd ..

# Step 3: Add `.nvmrc`, `.npmrc`, and engines to package.json
echo "📁 Writing .nvmrc and .npmrc..."
echo "20.11.1" > .nvmrc
echo "engine-strict=true" > .npmrc

echo "📦 Updating package.json with engines..."
npx --yes json -I -f package.json -e 'this.engines={"node":">=18 <=21"}'

# Step 4: Reinstall everything cleanly
echo "📥 Reinstalling dependencies..."
npm install
cd mobile && npm install && cd ..

# Step 5: Fix audit vulnerabilities
echo "🔒 Fixing vulnerabilities..."
npm audit fix
cd mobile && npm audit fix --legacy-peer-deps && cd ..

# Final instructions
echo "✅ Done. Your environment is fixed and vulnerabilities addressed. Now you can run:"
echo ""
echo "   cd mobile"
echo "   npm run web"