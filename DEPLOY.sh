#!/bin/bash
set -e

echo "=== NRI PA Deploy Script ==="
echo ""

# 1. Verify git status
echo "[1/4] Checking git status..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "ERROR: Not a git repository. Run: git init && git add -A && git commit -m 'initial'"
  exit 1
fi

# 2. Build
echo "[2/4] Building..."
npm run build
echo "Build successful."
echo ""

# 3. Deploy to Vercel
echo "[3/4] Deploying to Vercel production..."
vercel deploy --prod --cwd "$(pwd)"
echo "Deploy successful."
echo ""

# 4. Verify
echo "[4/4] Verifying..."
BUNDLE=$(curl -s "https://nri-personal-assistant.vercel.app" | grep -o '/assets/index-[^"]*\.js')
echo "Live bundle: $BUNDLE"
echo ""
echo "=== Deploy complete ==="
echo "URL: https://nri-personal-assistant.vercel.app"
echo "Inspector: https://vercel.com/apoorva-mishra-s-projects/nri-personal-assistant"
