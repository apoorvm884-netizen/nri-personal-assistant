# NRI Personal Assistant — Production Deployment Checklist

## What This Does

Moves PocketBase from your Mac to Google Cloud so the app works even when your Mac is off.

## Before You Start

You need:
- Google Cloud account (you have this)
- DeepSeek API key (get from https://platform.deepseek.com/api_keys — sign up, create key)
- A domain name (optional) — if you want https://api.yourdomain.com instead of a raw IP

---

## Step-by-Step Instructions

### Step 1 — Find your Google Cloud Project ID

1. Go to https://console.cloud.google.com
2. At the top, click the project dropdown
3. Note the **Project ID** (looks like `my-project-123456`)
4. Write it here: **\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

### Step 2 — Find your DeepSeek API Key

1. Go to https://platform.deepseek.com/api_keys
2. Click "Create API Key"
3. Copy the key (starts with `sk-`)
4. Write it here: **\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

### Step 3 — Open Terminal

Open the Terminal app on your Mac.

Copy and paste each block below one at a time. Press Enter after each.

### Step 4 — Navigate to the project folder

```bash
cd "/Users/apoorvsmac/Documents/Support Manual/Lovable project/nri-personal-assistant"
```

### Step 5 — Run the deployment script

```bash
bash DEPLOY.sh
```

The script will:
- Ask for your Google Cloud Project ID (type it and press Enter)
- Open a browser to log into Google Cloud (log in with your Google account)
- Ask for your domain name (optional — press Enter to skip, but a domain is needed for SSL)
- Run for 2-5 minutes

### Step 6 — Set the DeepSeek API Key in Vercel

After the script finishes:

1. Go to https://vercel.com/apoorva-mishra-s-projects/nri-personal-assistant/settings/environment-variables
2. Click "Add New"
3. **Name:** `DEEPSEEK_API_KEY`
4. **Value:** Paste your key from Step 2
5. **Environments:** Select Production
6. Click "Save"

### Step 7 — If you used a domain: Point DNS

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

| Type | Name | Value |
|---|---|---|
| A | `api` (or whatever you used) | \[VM IP from script output\] |

### Step 8 — Redeploy the frontend

In Terminal, run:

```bash
cd "/Users/apoorvsmac/Documents/Support Manual/Lovable project/nri-personal-assistant"
npx vercel build --prod
npx vercel deploy --prebuilt --prod --yes
```

### Step 9 — Verify the app works

1. Open https://nri-personal-assistant.vercel.app in a browser
2. Click "Client Portal"
3. Log in with: `client@nripa.com` / `nripa2024`
4. You should see the dashboard with your requests
5. Go to https://nri-personal-assistant.vercel.app/admin
6. Log in with: `admin@nripa.com` / `admin2024`
7. You should see the admin panel

### Step 10 — Final test: Shut down your Mac

1. Click Apple menu → Sleep (or shut down)
2. Wait 30 seconds
3. Open https://nri-personal-assistant.vercel.app on your phone or another computer
4. Log in — it should work even though your Mac is off

---

## If Something Goes Wrong

**"Permission denied" or "gcloud: command not found"**
Run this first:
```bash
brew install --cask google-cloud-sdk
```
Then restart Terminal and start again from Step 4.

**"Project not found"**
You typed the wrong Project ID. Go back to Step 1 and verify.

**Script fails mid-way**
Run it again. Most steps are idempotent (safe to re-run).

**App loads but login says "Failed to connect"**
The new PB URL wasn't picked up. Run Step 8 again.

**Everything is broken**
Rollback — see ROLLBACK.md.

---

## Once Migration is Complete

- You can safely shut down your Mac anytime
- The app keeps working: Vercel serves the frontend, Google Cloud runs the database
- To manage the server later: `gcloud compute ssh nri-pocketbase --zone=us-central1-a`
- Monthly cost: $0 (free tier) for the VM, plus whatever Vercel charges
