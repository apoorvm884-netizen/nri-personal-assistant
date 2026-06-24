# NRI Personal Assistant — Rollback Procedure

## Scenario A — Google Cloud VM is running but app is broken

### Restore previous PocketBase endpoint on Vercel

```bash
# 1. Get the OLD PocketBase URL from the backup .env.local
#    (DEPLOY.sh saved the old value before changing it)
#    Look for it in the script output, or check:

cat ~/Desktop/NRI_Backups/rollback-pb-url.txt 2>/dev/null || echo "No rollback file found"

# 2. If you know the old URL (was a localhost.run tunnel or dev URL),
#    set it back in Vercel without rebuilding:

cd "/Users/apoorvsmac/Documents/Support Manual/Lovable project/nri-personal-assistant"

# Set the old URL as the new env var (this does NOT delete the current one)
echo "https://<OLD_TUNNEL_OR_DEV_URL>" | npx vercel env add VITE_POCKETBASE_URL production --yes

# Verify
npx vercel env ls --environment production | grep VITE_POCKETBASE_URL

# Promote the PREVIOUS working deployment (no rebuild needed):
npx vercel list --prod | head -5
# Find the deployment BEFORE the migration
# Copy its URL (looks like nri-personal-assistant-xxxxx.vercel.app)
npx vercel alias set <PREVIOUS_DEPLOYMENT_URL> nri-personal-assistant.vercel.app

echo "Rollback complete. The app now uses the old deployment with the old backend."
```

## Scenario B — Google Cloud VM is not working, need to restore local setup

### Step 1 — Ensure PocketBase is running locally

```bash
# Check if PB is running
curl -s http://127.0.0.1:8090/api/health

# If not, start it:
cd /Users/apoorvsmac/Downloads/pocketbase_0.39.4_darwin_arm64
./pocketbase serve --dir=pb_data &
sleep 3
curl -s http://127.0.0.1:8090/api/health
```

### Step 2 — Restore the previous Vercel deployment

```bash
cd "/Users/apoorvsmac/Documents/Support Manual/Lovable project/nri-personal-assistant"

# List recent deployments and find the one BEFORE migration
npx vercel list --prod

# Promote the previous deployment (no rebuild):
# Replace URL with the one before migration
npx vercel alias set <PREVIOUS_DEPLOYMENT_URL> nri-personal-assistant.vercel.app

echo "The previous deployment already has the old PocketBase URL baked in."
echo "No rebuild needed. The app is restored."
```

### Step 3 — Verify

Open https://nri-personal-assistant.vercel.app and confirm login works.

## Scenario C — Google Cloud VM has corrupted data

### Restore data from Desktop backup

```bash
# 1. Find the backup on Desktop
ls -la ~/Desktop/NRI_Backups/

# 2. Upload it to the VM
gcloud compute scp ~/Desktop/NRI_Backups/nri-pb-data-<DATE>.tar.gz \
  nri-pocketbase:~/pb_restore.tar.gz --zone=us-central1-a

# 3. On the VM: stop PB, restore, restart
gcloud compute ssh nri-pocketbase --zone=us-central1-a --command='bash -s' << 'EOF'
set -euxo pipefail
sudo systemctl stop pocketbase
cp ~/pb_data/data.db ~/pb_data/data.db.corrupted-backup
tar -xzf ~/pb_restore.tar.gz -C ~/pb_data/
sqlite3 ~/pb_data/data.db "PRAGMA integrity_check;"
sudo systemctl start pocketbase
sleep 3
sudo systemctl status pocketbase --no-pager
EOF

# 4. App still points to the VM URL (no Vercel change needed)
#    If the VM URL changed, update VITE_POCKETBASE_URL in Vercel:
#    https://vercel.com/apoorva-mishra-s-projects/nri-personal-assistant/settings/environment-variables
```

## Key principles

- **Never rebuild the app for a rollback.** Always promote a previous deployment.
- **The old deployment already has the old PocketBase URL baked in.**
- **The local data on your Mac was never modified** — it is always the source of truth.
- **Desktop backups in `~/Desktop/NRI_Backups/`** preserve pre-migration snapshots.
