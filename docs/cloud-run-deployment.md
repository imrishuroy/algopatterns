# Cloud Run Deployment Guide

This guide documents the setup for deploying the AlgoPatterns backend to Google Cloud Run with automated GitHub Actions deployment.

## Overview

| Component | Service | Notes |
|-----------|---------|-------|
| Backend Hosting | Google Cloud Run | asia-south1 (Mumbai) |
| Container Registry | Artifact Registry | asia-south1 |
| Database | CockroachDB Serverless | ap-south-1 |
| Secrets | Cloud Run env vars | Encrypted at rest |
| CI/CD | GitHub Actions | Workload Identity Federation |
| Custom Domain | Cloudflare Workers | api.algopatterns.in |
| SSL/DDoS | Cloudflare | Free tier |

## URLs

- **Production API:** https://api.algopatterns.in
- **Cloud Run Direct:** https://algopatterns-api-ythmd2coqq-el.a.run.app
- **Health Check:** https://api.algopatterns.in/health

## Prerequisites

- Google Cloud account with billing enabled
- GitHub repository access
- Cloudflare account (free)
- `gcloud` CLI installed ([Install Guide](https://cloud.google.com/sdk/docs/install))

## Architecture

```
┌─────────┐     ┌────────────┐     ┌───────────┐     ┌──────────────┐
│ Browser │────▶│ Cloudflare │────▶│ Cloud Run │────▶│ CockroachDB  │
└─────────┘     │  (Worker)  │     │  (Go API) │     │ (Serverless) │
                └────────────┘     └───────────┘     └──────────────┘
```

```
GitHub (push to main) → GitHub Actions → Build Docker Image → Push to Artifact Registry → Deploy to Cloud Run
```

- **Region:** asia-south1 (Mumbai)
- **Database:** CockroachDB Serverless (ap-south-1)
- **Secrets:** Cloud Run environment variables (not Secret Manager)

## Initial GCP Setup

### 1. Initialize gcloud

```bash
gcloud init
# Select or create project: algopatterns
```

### 2. Set Default Region

```bash
gcloud config set run/region asia-south1
```

### 3. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com
```

### 4. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create algopatterns \
  --repository-format=docker \
  --location=asia-south1
```

## Service Account Setup

### 1. Create Service Account for GitHub Actions

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"
```

### 2. Grant IAM Permissions

```bash
PROJECT_ID="algopatterns"

# Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Service Account User
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

Note: Secret Manager roles are not needed since we use Cloud Run env vars instead.

## Workload Identity Federation

This allows GitHub Actions to authenticate with GCP without storing service account keys.

### 1. Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### 2. Create OIDC Provider

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='imrishuroy/algopatterns'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3. Allow GitHub Repo to Impersonate Service Account

```bash
PROJECT_ID="algopatterns"

gcloud iam service-accounts add-iam-policy-binding \
  github-actions@$PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/785336313924/locations/global/workloadIdentityPools/github-pool/attribute.repository/imrishuroy/algopatterns"
```

## Environment Variables

All environment variables (including secrets) are configured directly in the Cloud Run console under **Variables & Secrets** tab. This approach was chosen over GCP Secret Manager to reduce costs (Secret Manager charges per access, which adds up with scale-to-zero cold starts).

**To update environment variables:**
1. Go to Cloud Run console → algopatterns-api → Edit & Deploy New Revision
2. Go to Variables & Secrets tab
3. Add/update variables
4. Click Deploy

**Sensitive variables stored as plain env vars:**
- `JWT_SECRET` - JWT signing key (rotate = all sessions invalidated)
- `DB_PASSWORD` - CockroachDB password
- `SMTP_PASSWORD` - Email account password (from Hostinger)
- `RAZORPAY_KEY_SECRET` - Payment gateway secret
- `GOOGLE_CLIENT_SECRET` - OAuth secret
- API keys (OpenAI, DeepSeek, Judge0, etc.)

Note: Cloud Run env vars are encrypted at rest and only visible to users with Cloud Run Admin IAM access.

## GitHub Secrets

Add these secrets in GitHub repository settings (Settings → Secrets → Actions):

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `algopatterns` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/785336313924/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | `github-actions@algopatterns.iam.gserviceaccount.com` |
| `DB_HOST` | CockroachDB host |
| `DB_USER` | Database username |
| `DB_NAME` | Database name |
| `ALLOWED_ORIGINS` | Comma-separated origins (e.g., `http://localhost:3000,https://algopatterns.in`) |
| `JUDGE0_URL` | Judge0 API URL |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `SMTP_HOST` | SMTP server host |
| `SMTP_USER` | SMTP username |
| `EMAIL_FROM` | From email address |

## GitHub Actions Workflow

The workflow is defined in `.github/workflows/deploy-backend.yml`.

**Triggers:**
- Push to `main` branch (changes in `backend/` directory)
- Manual trigger via `workflow_dispatch`

**Process:**
1. Checkout code
2. Authenticate to GCP via Workload Identity
3. Build Docker image
4. Push to Artifact Registry
5. Deploy to Cloud Run

## Cloud Run Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `memory` | 512Mi | Memory per instance |
| `cpu` | 1 | CPU per instance |
| `min-instances` | 0 | Scale to zero when idle |
| `max-instances` | 3 | Maximum instances |
| `concurrency` | 80 | Requests per instance |
| `timeout` | 300s | Request timeout |

## Useful Commands

### View Service URL

```bash
gcloud run services describe algopatterns-api --region asia-south1 --format='value(status.url)'
```

### View Logs

```bash
gcloud run services logs read algopatterns-api --region asia-south1
```

### List Revisions

```bash
gcloud run revisions list --service algopatterns-api --region asia-south1
```

### Manual Deploy

```bash
cd backend
gcloud run deploy algopatterns-api --source . --region asia-south1
```

## Custom Domain Setup (Cloudflare)

Cloud Run domain mapping is not available in asia-south1. We use Cloudflare Workers as a proxy.

### Why Cloudflare?

- Cloud Run doesn't recognize custom domain Host headers
- Cloudflare Workers can rewrite requests to Cloud Run
- Free tier: 100k requests/day
- Bonus: DDoS protection, SSL, global edge network

### Step 1: Add Domain to Cloudflare

1. Sign up at https://cloudflare.com
2. Add your domain (e.g., `algopatterns.in`)
3. Select **Free plan**
4. Update nameservers at your registrar (e.g., Hostinger) to Cloudflare's nameservers

### Step 2: Add DNS Record

1. Go to **DNS** → **Records**
2. Add record:
   - **Type:** CNAME
   - **Name:** `api`
   - **Target:** `algopatterns-api-ythmd2coqq-el.a.run.app`
   - **Proxy:** Enabled (orange cloud)

### Step 3: Configure SSL

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full**

### Step 4: Create Cloudflare Worker

Cloud Run requires the correct Host header. A Worker rewrites requests.

1. Go to **Workers & Pages** → **Create Worker**
2. Click **Start with Hello World!**
3. Replace code with:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = "algopatterns-api-ythmd2coqq-el.a.run.app";
    
    const newRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return fetch(newRequest);
  }
}
```

4. Click **Deploy**

### Step 5: Add Route to Worker

1. Go to your Worker → **Settings** → **Domains & Routes**
2. Click **+ Add Domain**
3. Select **Route pattern** tab
4. Enter: `api.algopatterns.in/*`
5. Save

### Step 6: Verify

```bash
curl https://api.algopatterns.in/health
```

### Optional: Add Caching

Update Worker to cache public endpoints:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = "algopatterns-api-ythmd2coqq-el.a.run.app";
    
    const newRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const response = await fetch(newRequest);
    
    // Cache GET requests for patterns/problems (5 min)
    if (request.method === "GET" && url.pathname.match(/^\/(api\/v1\/patterns|api\/v1\/problems)/)) {
      const cachedResponse = new Response(response.body, response);
      cachedResponse.headers.set("Cache-Control", "public, max-age=300");
      return cachedResponse;
    }
    
    return response;
  }
}
```

### Cloudflare Benefits (Free Tier)

| Feature | Included |
|---------|----------|
| DDoS Protection | Yes |
| SSL/TLS | Yes |
| Global Edge Network | Yes (300+ locations) |
| Basic Analytics | Yes |
| Workers | 100k requests/day |
| Caching | Configurable |

### Latency Impact

Minimal (1-5ms) — Workers run at the nearest edge location.

## Troubleshooting

### Secret Access Denied

If deployment fails with "Permission denied on secret":

```bash
gcloud projects add-iam-policy-binding algopatterns \
  --member="serviceAccount:785336313924-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Workload Identity Issues

Verify the attribute condition matches your repository:

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --location="global" \
  --workload-identity-pool="github-pool"
```

### View Deployment Errors

```bash
gcloud run services describe algopatterns-api --region asia-south1
```

## Cost Estimation

| Resource | Estimated Cost |
|----------|---------------|
| Cloud Run (low traffic) | ~$0-5/month |
| Artifact Registry | ~$0.10/GB/month |
| Cloudflare | Free |
| **Total** | **~$2-5/month** |

Note: We don't use GCP Secret Manager (saves ~$3-4/month in access costs with scale-to-zero).

### Free Tier Limits

**Cloud Run:**
- 2 million requests/month
- 360,000 GB-seconds compute
- 180,000 vCPU-seconds

**Cloudflare Workers:**
- 100,000 requests/day
- 10ms CPU time per request

**CockroachDB Serverless:**
- 10 GiB storage
- 50M Request Units/month

## Quick Reference

### Deploy Manually

```bash
cd backend
gcloud run deploy algopatterns-api --source . --region asia-south1
```

### View Logs

```bash
# Stream logs
gcloud run services logs tail algopatterns-api --region asia-south1

# Read recent logs
gcloud run services logs read algopatterns-api --region asia-south1 --limit 100
```

### Update Secrets

```bash
# Add new version to existing secret
echo -n "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-

# View secret versions
gcloud secrets versions list SECRET_NAME
```

### Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service algopatterns-api --region asia-south1

# Route traffic to previous revision
gcloud run services update-traffic algopatterns-api \
  --region asia-south1 \
  --to-revisions REVISION_NAME=100
```

### Check Service Status

```bash
gcloud run services describe algopatterns-api --region asia-south1
```

## Monitoring

- **Cloud Run Console:** https://console.cloud.google.com/run
- **Logs:** https://console.cloud.google.com/logs
- **Cloudflare Analytics:** https://dash.cloudflare.com (select domain → Analytics)
- **Billing:** https://console.cloud.google.com/billing
