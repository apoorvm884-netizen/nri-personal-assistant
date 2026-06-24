#!/usr/bin/env bash
# ============================================================================
# NRI Personal Assistant — Deploy Frontend to Vercel
#
# Builds the frontend and deploys to Vercel in one command.
# No GitHub required.
# ============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "================================================================"
echo "  NRI Personal Assistant — Deploy Frontend"
echo "================================================================"
echo ""

# -----------------------------------------------------------
# 1. npm install (if needed)
# -----------------------------------------------------------
echo ">>> Installing dependencies..."
cd "$PROJECT_DIR"

if [ -f "package-lock.json" ]; then
  npm ci --silent
else
  npm install --silent
fi

echo "    ✅ Dependencies installed"
echo ""

# -----------------------------------------------------------
# 2. Build
# -----------------------------------------------------------
echo ">>> Building frontend..."
npm run build
echo "    ✅ Build successful"
echo ""

# -----------------------------------------------------------
# 3. Deploy to Vercel
# -----------------------------------------------------------
echo ">>> Deploying to Vercel..."
DEPLOY_OUTPUT=$(vercel deploy --prod 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract the deploy URL from the output
DEPLOYED_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https?://[a-zA-Z0-9.-]+\.vercel\.app' | head -1)
if [ -z "$DEPLOYED_URL" ]; then
  # Deploy might succeed but URL may not match pattern; check for any https:// in output
  DEPLOYED_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https?://[^ ]+' | head -1)
fi

if [ -n "$DEPLOYED_URL" ]; then
  echo ""
  echo "================================================================"
  echo "  ✅ DEPLOYED SUCCESSFULLY"
  echo "================================================================"
  echo ""
  echo "  URL: $DEPLOYED_URL"
  echo ""
  echo "================================================================"
else
  echo ""
  echo "  ✅ Deployment command finished. Check output above for the URL."
  echo "  You can also find it at: https://vercel.com/dashboard"
fi
