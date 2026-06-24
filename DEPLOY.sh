#!/usr/bin/env bash
# ============================================================================
# NRI Personal Assistant — PocketBase Migration to Google Cloud
#
# Moves PocketBase from local Mac to a GCP Compute Engine VM.
# After this script completes, PocketBase runs on GCP with a static IP.
# Frontend is NOT changed — you will attach domain + SSL + update Vercel later.
# ============================================================================
set -euo pipefail

PROJECT_DIR="/Users/apoorvsmac/Documents/Support Manual/Lovable project/nri-personal-assistant"
LOCAL_PB_DIR="/Users/apoorvsmac/Downloads/pocketbase_0.39.4_darwin_arm64/pb_data"

echo "================================================================"
echo "  NRI Personal Assistant — PocketBase → Google Cloud"
echo "  (No domain, no SSL, no frontend changes)"
echo "================================================================"
echo ""

# ============================================================================
# PRE-FLIGHT VALIDATION
# ============================================================================
echo ">>> Pre-flight validation..."

FAILED=0

if [ ! -d "$LOCAL_PB_DIR" ]; then
  echo "    ❌ LOCAL_PB_DIR does not exist: $LOCAL_PB_DIR"
  FAILED=1
else
  echo "    ✅ LOCAL_PB_DIR exists: $LOCAL_PB_DIR"
fi

if [ ! -f "$LOCAL_PB_DIR/data.db" ]; then
  echo "    ❌ data.db not found in $LOCAL_PB_DIR"
  FAILED=1
else
  DB_SIZE=$(stat -f%z "$LOCAL_PB_DIR/data.db" 2>/dev/null || stat -c%s "$LOCAL_PB_DIR/data.db" 2>/dev/null)
  if [ "$DB_SIZE" -lt 102400 ]; then
    echo "    ❌ data.db size ($DB_SIZE bytes) is less than 100 KB — database may be empty or corrupted"
    FAILED=1
  else
    echo "    ✅ data.db exists and size ($DB_SIZE bytes) exceeds 100 KB"
  fi
fi

if [ ! -f "$LOCAL_PB_DIR/auxiliary.db" ]; then
  echo "    ❌ auxiliary.db not found in $LOCAL_PB_DIR"
  FAILED=1
else
  echo "    ✅ auxiliary.db exists"
fi

if curl -s --max-time 3 "http://127.0.0.1:8090/api/health" 2>/dev/null | grep -q '"code":200'; then
  echo "    ✅ PocketBase is running and accessible at http://127.0.0.1:8090"
else
  echo "    ❌ PocketBase is not accessible at http://127.0.0.1:8090 — is it running?"
  FAILED=1
fi

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "    Pre-flight validation FAILED. Fix the errors above and re-run."
  exit 1
fi
echo "    ✅ All pre-flight checks passed"
echo ""

# ============================================================================
# MIGRATION SUMMARY
# ============================================================================
echo ">>> Gathering migration summary..."

ADMIN_TOKEN=$(curl -s --max-time 5 "http://127.0.0.1:8090/api/collections/users/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@nripa.com","password":"admin2024"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

USER_COUNT=$(curl -s --max-time 5 "http://127.0.0.1:8090/api/collections/users/records?perPage=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalItems',0))" 2>/dev/null)
REQ_COUNT=$(curl -s --max-time 5 "http://127.0.0.1:8090/api/collections/requests/records?perPage=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalItems',0))" 2>/dev/null)

echo ""
echo "================================================================"
echo "  MIGRATION SUMMARY"
echo "================================================================"
echo "  Source:          http://127.0.0.1:8090 (local Mac)"
echo "  Destination:     Google Cloud VM (static IP)"
echo "  Database size:   $(du -h "$LOCAL_PB_DIR/data.db" | cut -f1)"
echo "  Users:           $USER_COUNT"
echo "  Requests:        $REQ_COUNT"
echo "================================================================"
echo ""
echo "This will:"
echo "  • Create a GCP e2-micro VM with a static external IP"
echo "  • Install PocketBase v0.39.4 on it"
echo "  • Copy your database (data.db + auxiliary.db) to the VM"
echo "  • Register PocketBase as a systemd service (auto-restart)"
echo ""
echo "This will NOT:"
echo "  • Change any Vercel environment variables"
echo "  • Rebuild or redeploy the frontend"
echo "  • Set up SSL or a domain"
echo "  • Modify your local PocketBase"
echo ""
read -r -p "Type YES to continue: " CONFIRMATION
if [ "$CONFIRMATION" != "YES" ]; then
  echo "    Aborted."
  exit 0
fi

# ============================================================================
# BACKUP TO DESKTOP
# ============================================================================
echo ""
echo ">>> Creating backup on Desktop..."
BACKUP_DIR="$HOME/Desktop/NRI_Backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/nri-pb-data-$(date +%Y%m%d-%H%M%S).tar.gz"

if [ -f "$BACKUP_FILE" ]; then
  echo "    ❌ Backup already exists: $BACKUP_FILE"
  echo "    Wait one second and re-run."
  exit 1
fi

echo "    Running SQLite integrity check on local database..."
SQLITE_CHECK=$(sqlite3 "$LOCAL_PB_DIR/data.db" "PRAGMA integrity_check;" 2>/dev/null || echo "ERROR")
if [ "$SQLITE_CHECK" != "ok" ]; then
  echo "    ❌ SQLite integrity check FAILED: $SQLITE_CHECK"
  echo "    The local database may be corrupted. Fix before migrating."
  exit 1
fi
echo "    ✅ SQLite integrity check: ok"

tar -czf "$BACKUP_FILE" \
  -C "$LOCAL_PB_DIR" \
  data.db auxiliary.db storage/

echo "    ✅ Created backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# ============================================================================
# STEP 1 — Install Google Cloud CLI
# ============================================================================
echo ""
echo ">>> Step 1: Check Google Cloud CLI..."
if ! command -v gcloud &>/dev/null; then
  echo "    Installing Google Cloud SDK..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install --cask google-cloud-sdk
  else
    echo "    Please install Google Cloud SDK manually: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi
fi

# ============================================================================
# STEP 2 — Authenticate with Google Cloud
# ============================================================================
echo ""
echo ">>> Step 2: Authenticate with Google Cloud..."
echo "    A browser window will open. Log in with your Google Cloud account."
gcloud auth login --quiet

echo "    To list projects: gcloud projects list"
read -r -p "    Enter your GCP project ID: " GCP_PROJECT
gcloud config set project "$GCP_PROJECT"

# ============================================================================
# STEP 3 — Enable Compute Engine API
# ============================================================================
echo ""
echo ">>> Step 3: Enable Compute Engine API..."
gcloud services enable compute.googleapis.com --project="$GCP_PROJECT"

# ============================================================================
# STEP 4 — Create firewall rule (port 8090 only)
# ============================================================================
echo ""
echo ">>> Step 4: Create firewall rule for PocketBase (port 8090)..."
gcloud compute firewall-rules create pocketbase-allow \
  --allow tcp:8090 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow PocketBase traffic" \
  --project="$GCP_PROJECT" 2>/dev/null || echo "    Firewall rule already exists (skipped)"

# ============================================================================
# STEP 5 — Reserve a static external IP
# ============================================================================
echo ""
echo ">>> Step 5: Reserve a static external IP..."
STATIC_IP_NAME="nri-pocketbase-ip"
gcloud compute addresses create "$STATIC_IP_NAME" \
  --region=us-central1 \
  --project="$GCP_PROJECT" 2>/dev/null || echo "    Static IP already exists (reusing)"

STATIC_IP=$(gcloud compute addresses describe "$STATIC_IP_NAME" \
  --region=us-central1 \
  --format='get(address)' \
  --project="$GCP_PROJECT")
echo "    Static IP: $STATIC_IP"

# ============================================================================
# STEP 6 — Create the VM with the static IP
# ============================================================================
echo ""
echo ">>> Step 6: Create e2-micro VM (free tier eligible)..."
VM_NAME="nri-pocketbase"
ZONE="us-central1-a"

gcloud compute instances create "$VM_NAME" \
  --zone="$ZONE" \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --address="$STATIC_IP" \
  --tags=pocketbase \
  --project="$GCP_PROJECT" \
  --quiet

echo "    VM created with static IP: $STATIC_IP"

# ============================================================================
# STEP 7 — Wait for VM to be ready (SSH accessible)
# ============================================================================
echo ""
echo ">>> Step 7: Wait for VM to be ready..."
for i in $(seq 1 30); do
  if gcloud compute ssh "$VM_NAME" \
    --zone="$ZONE" \
    --project="$GCP_PROJECT" \
    --command="echo ready" --quiet 2>/dev/null; then
    echo "    VM is ready"
    break
  fi
  echo "    Waiting... ($i/30)"
  sleep 5
done

# ============================================================================
# STEP 8 — Upload backup to VM
# ============================================================================
echo ""
echo ">>> Step 8: Upload database backup to VM..."
gcloud compute scp "$BACKUP_FILE" "$VM_NAME":~/pb_data.tar.gz \
  --zone="$ZONE" \
  --project="$GCP_PROJECT"

# ============================================================================
# STEP 9 — Install PocketBase and restore data on VM
# ============================================================================
echo ""
echo ">>> Step 9: Install PocketBase and restore data..."

gcloud compute ssh "$VM_NAME" \
  --zone="$ZONE" \
  --project="$GCP_PROJECT" \
  --command='bash -s' << 'REMOTE'
set -euxo pipefail

# Install dependencies
sudo apt-get update -qq
sudo apt-get install -y -qq wget unzip sqlite3

# Download PocketBase v0.39.4 Linux amd64
wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.39.4/pocketbase_0.39.4_linux_amd64.zip
unzip -q pocketbase_0.39.4_linux_amd64.zip
rm pocketbase_0.39.4_linux_amd64.zip
chmod +x pocketbase

# Create data directory and restore data
mkdir -p pb_data
tar -xzf pb_data.tar.gz -C pb_data/
rm pb_data.tar.gz

# Verify database integrity
echo "    Running SQLite integrity check..."
SQLITE_CHECK=$(sqlite3 pb_data/data.db "PRAGMA integrity_check;" 2>&1 || echo "ERROR")
if [ "$SQLITE_CHECK" != "ok" ]; then
  echo "    ❌ SQLite integrity check FAILED: $SQLITE_CHECK"
  exit 1
fi
echo "    ✅ SQLite integrity check: ok"
echo "    Database size: $(du -h pb_data/data.db | cut -f1)"
REMOTE

# ============================================================================
# STEP 10 — Install systemd service for PocketBase
# ============================================================================
echo ""
echo ">>> Step 10: Install PocketBase as a systemd service..."

gcloud compute ssh "$VM_NAME" \
  --zone="$ZONE" \
  --project="$GCP_PROJECT" \
  --command='bash -s' << 'REMOTE'
set -euxo pipefail

sudo tee /etc/systemd/system/pocketbase.service << 'SERVICE'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/home/ubuntu/pocketbase serve --dir=/home/ubuntu/pb_data --http=0.0.0.0:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sleep 3
sudo systemctl status pocketbase --no-pager
REMOTE

# ============================================================================
# STEP 11 — Verify PocketBase is reachable from the public internet
# ============================================================================
echo ""
echo ">>> Step 11: Verify PocketBase is reachable from public IP..."
sleep 5

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$STATIC_IP:8090/api/health" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
  echo "    ✅ PocketBase is running and reachable at http://$STATIC_IP:8090"
else
  echo "    ❌ Health check returned HTTP $HEALTH_CHECK"
  echo "    Check VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
  echo "    Then: sudo journalctl -u pocketbase -n 50"
  exit 1
fi

# Auth test
AUTH_TEST=$(curl -s --max-time 10 "http://$STATIC_IP:8090/api/collections/users/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@nripa.com","password":"admin2024"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('token') else 'FAIL')" 2>/dev/null || echo "FAIL")
echo "    Auth test (admin@nripa.com): $AUTH_TEST"

# Collection count verification
TOKEN=$(curl -s --max-time 10 "http://$STATIC_IP:8090/api/collections/users/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@nripa.com","password":"admin2024"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
VERIFIED_COUNT=$(curl -s --max-time 10 "http://$STATIC_IP:8090/api/collections/requests/records?perPage=1" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalItems',0))" 2>/dev/null)
echo "    Requests on GCP: $VERIFIED_COUNT (expected: $REQ_COUNT)"

if [ "$VERIFIED_COUNT" != "$REQ_COUNT" ]; then
  echo "    ❌ Record count mismatch — data may not have transferred correctly"
  exit 1
fi

echo ""
echo "    ✅ All verifications passed"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "=================================================================="
echo "  MIGRATION COMPLETE"
echo "=================================================================="
echo ""
echo "  PocketBase is now running on Google Cloud."
echo ""
echo "  VM name:       $VM_NAME"
echo "  VM zone:       $ZONE"
echo "  VM project:    $GCP_PROJECT"
echo "  Static IP:     $STATIC_IP"
echo "  PB URL:        http://$STATIC_IP:8090"
echo ""
echo "  To SSH into the VM:"
echo "    gcloud compute ssh $VM_NAME --zone=$ZONE --project=$GCP_PROJECT"
echo ""
echo "  To view PocketBase logs:"
echo "    gcloud compute ssh $VM_NAME --zone=$ZONE --command='sudo journalctl -u pocketbase -n 50 --no-pager'"
echo ""
echo "  Your local PocketBase is UNCHANGED."
echo "  Your frontend on Vercel still points to the old URL."
echo ""
echo "  NEXT STEPS (do these later, not now):"
echo "    1. Point a domain DNS A record → $STATIC_IP"
echo "    2. Run SSL setup on the VM (Caddy or Let's Encrypt)"
echo "    3. Update VITE_POCKETBASE_URL in Vercel → https://your-domain.com"
echo "    4. Rebuild and redeploy the frontend"
echo ""
echo "=================================================================="
