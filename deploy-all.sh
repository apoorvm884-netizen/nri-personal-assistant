#!/usr/bin/env bash
# ============================================================================
# NRI Personal Assistant — Deploy Everything (Frontend + Backend Check)
#
# 1. Deploys frontend to Vercel
# 2. Optionally restarts PocketBase on GCP (if backend files changed)
# 3. Runs post-deployment verification
#
# No GitHub required.
# ============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# -----------------------------------------------------------
# Configuration — edit these to match your setup
# -----------------------------------------------------------
PB_URL="${PB_URL:-http://34.28.181.49:8090}"
VM_NAME="${VM_NAME:-nri-pocketbase}"
VM_ZONE="${VM_ZONE:-us-central1-a}"
VM_PROJECT="${VM_PROJECT:-nri-personal-assistant-455918}"
VERCEL_URL="${VERCEL_URL:-https://nri-personal-assistant.vercel.app}"

echo "================================================================"
echo "  NRI Personal Assistant — Deploy Everything"
echo "================================================================"
echo ""
echo "  Frontend → Vercel"
echo "  Backend  → Google Cloud VM ($VM_NAME)"
echo "  PB URL   → $PB_URL"
echo ""

# ============================================================================
# STEP 1 — Deploy Frontend
# ============================================================================
echo "================================================================"
echo "  STEP 1: Deploy Frontend to Vercel"
echo "================================================================"
bash "$PROJECT_DIR/deploy-frontend.sh"
echo ""

# ============================================================================
# STEP 2 — Optionally restart PocketBase on GCP
# ============================================================================
echo "================================================================"
echo "  STEP 2: PocketBase Backend"
echo "================================================================"

read -r -p "  Restart PocketBase on GCP? (y/n): " RESTART_PB
if [ "$RESTART_PB" = "y" ] || [ "$RESTART_PB" = "Y" ]; then
  echo ""
  echo "  >>> Restarting PocketBase service on $VM_NAME..."

  if command -v gcloud &>/dev/null; then
    gcloud compute ssh "$VM_NAME" \
      --zone="$VM_ZONE" \
      --project="$VM_PROJECT" \
      --command="sudo systemctl restart pocketbase && sleep 2 && sudo systemctl status pocketbase --no-pager" --quiet
    echo "  ✅ PocketBase restarted"
  else
    echo "  ❌ gcloud CLI not found. Skipping restart."
  fi
else
  echo "  Skipped."
fi
echo ""

# ============================================================================
# STEP 3 — Post-Deployment Verification
# ============================================================================
echo "================================================================"
echo "  STEP 3: Post-Deployment Verification"
echo "================================================================"

if [ -f "$PROJECT_DIR/VERIFY.sh" ]; then
  bash "$PROJECT_DIR/VERIFY.sh" "$PB_URL" "$VERCEL_URL"
else
  echo "  VERIFY.sh not found. Running basic checks..."
  echo ""
  echo -n "  PocketBase health check... "
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PB_URL/api/health" 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then
    echo "✅"
  else
    echo "❌ (HTTP $HTTP)"
  fi

  echo -n "  Vercel frontend... "
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$VERCEL_URL" 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then
    echo "✅"
  else
    echo "❌ (HTTP $HTTP)"
  fi
fi

echo ""
echo "================================================================"
echo "  ✅ DEPLOY COMPLETE"
echo "================================================================"
echo ""
echo "  Frontend: $VERCEL_URL"
echo "  Backend:  $PB_URL"
echo ""
