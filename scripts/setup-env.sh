#!/bin/bash
# Usage: ./scripts/setup-env.sh [dev|prod]
# Sets up the correct Firebase config and environment for the specified environment.

set -e

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
  echo "Usage: ./scripts/setup-env.sh [dev|prod]"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Setting up environment: $ENV"

# Copy iOS Firebase config
if [ "$ENV" = "dev" ]; then
  cp "$PROJECT_DIR/ios/Glow/Firebase/Dev/GoogleService-Info.plist" "$PROJECT_DIR/ios/Glow/GoogleService-Info.plist"
  echo "  iOS: Copied Dev GoogleService-Info.plist"
else
  cp "$PROJECT_DIR/ios/Glow/Firebase/Prod/GoogleService-Info.plist" "$PROJECT_DIR/ios/Glow/GoogleService-Info.plist"
  echo "  iOS: Copied Prod GoogleService-Info.plist"
fi

echo ""
echo "Environment '$ENV' is ready!"
echo ""
echo "Next steps:"
echo "  iOS:     APP_ENV=$( [ "$ENV" = "prod" ] && echo "production" || echo "development" ) npx react-native run-ios"
echo "  Android: APP_ENV=$( [ "$ENV" = "prod" ] && echo "production" || echo "development" ) npx react-native run-android --mode=${ENV}Debug"
echo "  Metro:   APP_ENV=$( [ "$ENV" = "prod" ] && echo "production" || echo "development" ) npx react-native start --reset-cache"
