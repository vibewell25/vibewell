#!/bin/bash

# Fix Next.js configuration issues
echo "Fixing Next.js configuration issues..."

# 1. Remove .babelrc to enable SWC
echo "Removing .babelrc to enable SWC..."
rm -f .babelrc

# 2. Kill running Next.js processes on ports 3000-3005
echo "Killing any Next.js processes that might be running..."
for port in 3000 3001 3002 3003 3004 3005; do
  pid=$(lsof -t -i:$port)
  if [ ! -z "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid
  fi
done

# 3. Clear .next cache
echo "Clearing Next.js cache..."
rm -rf .next

# 4. Wait a moment
sleep 2

echo "All fixes applied! You can now run 'npm run dev' to start Next.js again." 