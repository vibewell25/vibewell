#!/usr/bin/env bash
# Automates deep clean and rebuild for mobile (iOS/Android) and Metro
set -e

echo "🔧 Starting deep-clean and rebuild workflow"

# 1. Reset the Native Build System (iOS)
echo "
=== Cleaning iOS project ==="
if [ -d "mobile/ios" ]; then
  cd mobile/ios
  rm -rf Pods Podfile.lock build
  pod cache clean --all
  pod install
  cd -
else
  echo "No ios folder found - skipping iOS clean"
fi

# 1b. Android cleanup (if applicable)
echo "
=== Cleaning Android project ==="
if [ -d "mobile/android" ]; then
  cd mobile/android
  ./gradlew clean
  cd -
else
  echo "No android folder found - skipping Android clean"
fi

# 2. Reset Metro Bundler Cache
echo "
=== Clearing Expo Metro cache ==="
cd mobile
# Remove Expo and Metro caches
rm -rf .expo metro-cache node_modules/.cache
# Start Expo to clear cache, then terminate after a short delay
npx expo start -c &
METRO_PID=$!
sleep 5
kill $METRO_PID || true
cd -

# 3. Clean Xcode DerivedData (macOS)
echo "
=== Cleaning Xcode DerivedData ==="
rm -rf ~/Library/Developer/Xcode/DerivedData

# 4. Ensure All Native Modules Are Installed Properly
echo "
=== Installing dependencies and CocoaPods ==="
npm install --legacy-peer-deps
cd mobile
npm install --legacy-peer-deps
if [ -d "ios" ]; then
  cd ios
  pod install
  cd ..
else
  echo "No ios folder found - skipping CocoaPods install"
fi
cd ..

# 5. (Optional) Force iOS simulator to x86_64 on Apple Silicon
echo "
=== (Optional) Run iOS on x86_64 Simulator ==="
echo "To run on x86_64: arch -x86_64 npx react-native run-ios --simulator=\"iPhone 14\""

# Final prompt
echo "
✅ Clean and rebuild complete! Now you can run:
   cd mobile && npx expo start" 