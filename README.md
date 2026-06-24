# NRI Personal Assistant

**Frontend** (React + Vite) — hosted on Vercel.
**Backend** (PocketBase) — hosted on Google Cloud VM.

No GitHub required for deployments.

---

## Deploy Frontend Only

```bash
bash deploy-frontend.sh
```

What it does:
1. Installs dependencies (`npm install` / `npm ci`)
2. Builds the app (`npm run build`)
3. Deploys to Vercel (`vercel deploy --prod`)
4. Displays the live URL

Stops on any build error. No GitHub commit needed.

## Deploy Backend (PocketBase → GCP)

Run this once to migrate PocketBase from your local Mac to Google Cloud:

```bash
bash DEPLOY.sh
```

See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) for step-by-step instructions.

After the initial migration, restart PocketBase on the VM if you make backend changes:

```bash
gcloud compute ssh nri-pocketbase --zone=us-central1-a \
  --command='sudo systemctl restart pocketbase'
```

## Deploy Everything

```bash
bash deploy-all.sh
```

What it does:
1. Deploys frontend to Vercel (same as `deploy-frontend.sh`)
2. Asks if you want to restart PocketBase on GCP
3. Runs verification (health checks, user auth, record counts, frontend routes)

Environment variables you can set:

| Variable | Default |
|---|---|
| `PB_URL` | `http://34.28.181.49:8090` |
| `VM_NAME` | `nri-pocketbase` |
| `VM_ZONE` | `us-central1-a` |
| `VM_PROJECT` | `nri-personal-assistant-455918` |
| `VERCEL_URL` | `https://nri-personal-assistant.vercel.app` |

Example:

```bash
PB_URL=http://YOUR_STATIC_IP:8090 bash deploy-all.sh
```

## Workflow

```
Edit code
  → bash deploy-all.sh
    → Application becomes live
```

No commits, no PRs, no GitHub. Push-to-deploy from your local machine.

## Verification

```bash
bash VERIFY.sh http://YOUR_STATIC_IP:8090
```

Checks: health endpoint, user auth (4 accounts), record counts (8 collections), frontend routes, CORS headers.

## Rollback

See [ROLLBACK.md](./ROLLBACK.md) for frontend and backend rollback procedures.
