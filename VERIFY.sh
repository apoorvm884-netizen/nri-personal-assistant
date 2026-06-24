#!/usr/bin/env bash
# ============================================================================
# NRI Personal Assistant — Post-Migration Verification Script
# Run this after completing DEPLOY.sh to confirm everything works.
# ============================================================================
set -euo pipefail

echo "============================================"
echo "  PRODUCTION VERIFICATION"
echo "============================================"
echo ""

PB_URL="${1:-}"
VERCEL_URL="${2:-https://nri-personal-assistant.vercel.app}"
PASS=0
FAIL=0

check() {
  local label="$1" result="$2"
  if [ "$result" = "PASS" ]; then
    echo "  ✅ $label"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $label"
    FAIL=$((FAIL + 1))
  fi
}

# -----------------------------------------------------------
# 1. Verify PB_URL was provided
# -----------------------------------------------------------
if [ -z "$PB_URL" ]; then
  echo "Usage: bash VERIFY.sh https://your-pocketbase-domain.com"
  echo "       bash VERIFY.sh http://<VM_IP>:8090"
  exit 1
fi

echo "PocketBase URL: $PB_URL"
echo "Vercel URL:     $VERCEL_URL"
echo ""

# -----------------------------------------------------------
# 2. PocketBase health check
# -----------------------------------------------------------
echo "--- PocketBase Health ---"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PB_URL/api/health" 2>/dev/null || echo "000")
check "PB health endpoint returns 200" "$([ "$HTTP" = "200" ] && echo "PASS" || echo "FAIL")"

# -----------------------------------------------------------
# 3. All 4 demo users can authenticate
# -----------------------------------------------------------
echo ""
echo "--- User Authentication ---"
for PAIR in "client@nripa.com:nripa2024" "premium@nripa.com:premium2024" "enterprise@nripa.com:enterprise2024" "admin@nripa.com:admin2024"; do
  EMAIL="${PAIR%%:*}"
  PASS="${PAIR##*:}"
  TOKEN=$(curl -s --max-time 10 "$PB_URL/api/collections/users/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$EMAIL\",\"password\":\"$PASS\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
  check "$EMAIL can authenticate" "$([ -n "$TOKEN" ] && [ "${#TOKEN}" -gt 20 ] && echo "PASS" || echo "FAIL")"
done

# -----------------------------------------------------------
# 4. Record counts match expected
# -----------------------------------------------------------
echo ""
echo "--- Data Integrity ---"
ADMIN_TOKEN=$(curl -s --max-time 10 "$PB_URL/api/collections/users/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@nripa.com","password":"admin2024"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

declare -A EXPECTED
EXPECTED[users]="4"
EXPECTED[requests]="6"
EXPECTED[messages]="6"
EXPECTED[reminders]="2"
EXPECTED[notifications]="2"
EXPECTED[life_profiles]="2"
EXPECTED[consultations]="0"
EXPECTED[system_settings]="0"

for COL in users requests messages reminders notifications life_profiles consultations system_settings; do
  COUNT=$(curl -s --max-time 10 "$PB_URL/api/collections/$COL/records?perPage=1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalItems','ERR'))" 2>/dev/null)
  EXP="${EXPECTED[$COL]}"
  if [ "$COUNT" = "$EXP" ]; then
    check "$COL: $COUNT records (expected $EXP)" "PASS"
  else
    check "$COL: $COUNT records (expected $EXP)" "FAIL"
  fi
done

# -----------------------------------------------------------
# 5. Vercel routes return 200
# -----------------------------------------------------------
echo ""
echo "--- Vercel Frontend ---"
for ROUTE in "/" "/login" "/portal" "/admin" "/services" "/pricing" "/about"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$VERCEL_URL$ROUTE" 2>/dev/null || echo "000")
  check "$VERCEL_URL$ROUTE returns 200" "$([ "$HTTP" = "200" ] && echo "PASS" || echo "FAIL")"
done

# -----------------------------------------------------------
# 6. JS bundle contains the PB URL
# -----------------------------------------------------------
echo ""
echo "--- Env Var in Bundle ---"
JS_FILE=$(curl -sL "$VERCEL_URL" | grep -oE 'src="[^"]*\.js"' | head -1 | sed 's/src="//;s/"//')
if [ -n "$JS_FILE" ]; then
  DOMAIN=$(echo "$PB_URL" | sed 's|https\?://||;s|:.*||')
  if curl -sL "$VERCEL_URL$JS_FILE" | grep -q "$DOMAIN"; then
    check "PB URL ($DOMAIN) in JS bundle" "PASS"
  else
    check "PB URL ($DOMAIN) in JS bundle" "FAIL"
  fi
fi

# -----------------------------------------------------------
# 7. CORS — login via browser fetch simulation
# -----------------------------------------------------------
echo ""
echo "--- CORS ---"
CORS_HEADERS=$(curl -s -I -X OPTIONS --max-time 10 "$PB_URL/api/health" 2>/dev/null | grep -i "access-control-allow-origin" || true)
if [ -n "$CORS_HEADERS" ]; then
  check "CORS headers present" "PASS"
else
  check "CORS headers present" "WARN — PB defaults to allow all, but verify"
fi

# -----------------------------------------------------------
# Summary
# -----------------------------------------------------------
echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "  Some checks failed. Review above for details."
  echo "  Debug commands:"
  echo "    gcloud compute ssh nri-pocketbase --zone=us-central1-a"
  echo "    sudo journalctl -u pocketbase -n 50 --no-pager"
  echo "    curl -s $PB_URL/api/health"
  exit 1
else
  echo ""
  echo "  ✅ ALL CHECKS PASSED"
  echo "  The application is fully production-ready."
  echo "  You can now shut down your Mac."
  exit 0
fi
