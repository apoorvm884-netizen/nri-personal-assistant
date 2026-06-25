# Deployment Guide

## Overview
This project uses **GitHub → Vercel auto-deploy**. Every push to `main` triggers a production deployment.

## Branch Strategy
| Branch | Purpose |
|--------|---------|
| `main` | Production — every push auto-deploys to Vercel |
| `feature/*` | Create feature branches for development, merge via PR to `main` |

## Quick Start
```bash
# Make changes, commit, push — Vercel auto-deploys
git add .
git commit -m "Description of change"
git push origin main
```

Deploy URL: https://nri-personal-assistant.vercel.app

## Manual Deploy (if needed)
```bash
./deploy.sh
```

## Environment Variables
Set in Vercel Dashboard > Project Settings > Environment Variables:
- `VITE_PB_URL` — PocketBase URL (VM: `http://34.123.136.226:8090`)
- `VITE_PB_ADMIN_EMAIL` — admin@nripa.com
- `VITE_PB_ADMIN_PASSWORD` — stored in 1Password

## Rollback
1. Go to Vercel Dashboard > Deployments
2. Find the working deployment
3. Click "..." > "Promote to Production"

## Verify Deployment
Check the footer at https://nri-personal-assistant.vercel.app/admin:
- Version (matches package.json)
- Build Time
- Deployment ID
- Commit Hash

## Health Check
https://nri-personal-assistant.vercel.app/health
