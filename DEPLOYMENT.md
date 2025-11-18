# Deployment Guide - Disruption Weekly Backend

Complete step-by-step deployment instructions for the Disruption Weekly Processing Engine.

---

## 🚀 Quick Deploy to Vercel (5 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- LLM API key (Anthropic, OpenAI, or Gemini)

---

## Step 1: Push to GitHub

```bash
cd /Users/devenspear/VibeCodingProjects/disweekly-backend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Disruption Weekly backend"

# Add remote (already exists)
git remote add origin https://github.com/devenspear/DisWeekly-PluginEngine.git

# Push to main
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Vercel

### Via Vercel Dashboard

1. Go to https://vercel.com/
2. Click "Add New Project"
3. Import `DisWeekly-PluginEngine` repository
4. Configure:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. Click "Deploy" (will fail initially - need env vars)

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /Users/devenspear/VibeCodingProjects/disweekly-backend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy
```

---

## Step 3: Configure Environment Variables

### In Vercel Dashboard

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables:

#### Required Variables

```
Name: LLM_PROVIDER
Value: anthropic
```

```
Name: ANTHROPIC_API_KEY
Value: sk-ant-your-actual-key-here
```

```
Name: AUTH_TOKENS
Value: your-generated-token-1,your-generated-token-2
```

#### Optional Variables (if using other LLMs)

```
Name: OPENAI_API_KEY
Value: sk-your-openai-key
```

```
Name: GEMINI_API_KEY
Value: your-gemini-key
```

### Generate Auth Tokens

On your local machine:

```bash
# Generate 3 secure tokens
node -e "for(let i=0;i<3;i++) console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output will be 3 random tokens:
# a1b2c3d4e5f6...
# g7h8i9j0k1l2...
# m3n4o5p6q7r8...
```

Use these in AUTH_TOKENS (comma-separated):
```
AUTH_TOKENS=a1b2c3d4e5f6...,g7h8i9j0k1l2...,m3n4o5p6q7r8...
```

---

## Step 4: Redeploy with Environment Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~1-2 minutes)

---

## Step 5: Verify Deployment

### Get Your Production URL

Vercel will give you a URL like:
```
https://your-project-name.vercel.app
```

### Test the Health Check

```bash
# Replace with your actual URL and token
curl -H "Authorization: Bearer your-token-here" \
  https://your-project-name.vercel.app/api/url-writer/ping
```

Expected response:
```json
{
  "status": "ok",
  "message": "Disruption Weekly URL Writer API is running",
  "timestamp": "2025-11-17T..."
}
```

---

## Step 6: Update Chrome Extension

1. Open Chrome Extension settings
2. Enter:
   - **Backend Base URL**: `https://your-project-name.vercel.app`
   - **Auth Token**: One of your AUTH_TOKENS
3. Click "Test Connection" → Should see success ✅
4. Click "Save Settings"

---

## Step 7: Test End-to-End

1. Navigate to any article (TechCrunch, Medium, etc.)
2. Click Disruption Capture extension icon
3. Wait 10-30 seconds for processing
4. Should see:
   - 2 headlines
   - 6 bullets
   - Validation info
5. Click "Copy" to test clipboard

✅ **You're live!**

---

## 🔧 Configuration Details

### Recommended Settings

| Setting | Value | Why |
|---------|-------|-----|
| LLM_PROVIDER | `anthropic` | Best quality for Disruption Weekly format |
| AUTH_TOKENS | 2-3 tokens | One for you, extras for team |
| Region | `iad1` (US East) | Lowest latency for US users |

### LLM Provider Comparison

| Provider | Model | Speed | Cost/1M tokens | Quality |
|----------|-------|-------|----------------|---------|
| Anthropic | Claude 3.5 Sonnet | Fast | $3 | ⭐⭐⭐⭐⭐ |
| OpenAI | GPT-4 Turbo | Medium | $10 | ⭐⭐⭐⭐ |
| Gemini | Gemini Pro | Fast | $0.50 | ⭐⭐⭐ |

**Recommendation**: Start with Anthropic Claude for best results.

---

## 🔒 Security Checklist

Before going live:

- [ ] AUTH_TOKENS are random and secure (32+ characters)
- [ ] API keys are in Vercel environment (not hardcoded)
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Only authorized team members have AUTH_TOKENS
- [ ] Vercel project is set to private
- [ ] HTTPS only (Vercel handles this automatically)

---

## 📊 Monitoring

### Vercel Dashboard

Monitor your API:
1. Go to Vercel dashboard → your project
2. Click **"Analytics"**
   - Request volume
   - Response times
   - Error rates
3. Click **"Logs"**
   - Real-time function logs
   - Error stack traces
   - Request details

### Useful Log Searches

In Vercel logs, search for:
- `Processing article:` - See all processed URLs
- `Successfully processed` - Track successes
- `Error processing` - Find failures
- `validation failed` - Quality issues

---

## 🐛 Troubleshooting Deployment

### Build Fails

**Error**: `Module not found`
**Fix**: Run `npm install` locally, check `package.json`

**Error**: `Type errors`
**Fix**: Run `npm run type-check` locally, fix TypeScript errors

### Runtime Errors

**Error**: `No LLM API key configured`
**Fix**: Add API key to Vercel environment variables, redeploy

**Error**: `AUTH_TOKENS not configured`
**Fix**: Add AUTH_TOKENS to Vercel environment variables

### Extension Can't Connect

**Error**: `Could not reach Disruption Engine`
**Fix**:
1. Verify backend URL (no trailing slash)
2. Test `/ping` endpoint with curl
3. Check Vercel function logs for errors
4. Verify AUTH_TOKEN is correct

---

## 🔄 Updates & Redeployment

### Update Code

```bash
cd /Users/devenspear/VibeCodingProjects/disweekly-backend

# Make your changes
# ...

# Commit and push
git add .
git commit -m "Updated feature X"
git push origin main

# Vercel auto-deploys on push to main
```

### Update Environment Variables

1. Vercel Dashboard → Project Settings → Environment Variables
2. Edit existing variable
3. Click "Save"
4. Redeploy from Deployments tab

### Update Prompt

1. Edit `lib/prompts.ts`
2. Commit and push
3. Vercel auto-deploys
4. Extension users can click "Regenerate" for new prompt

---

## 💰 Cost Estimation

### Vercel Costs

- **Free Tier**: 100GB bandwidth, 100 hours serverless
- **Pro Tier** ($20/mo): 1TB bandwidth, unlimited serverless
- Most projects stay on free tier

### LLM API Costs (per 1000 articles)

Assuming ~1200 words/article:

| Provider | Input Cost | Output Cost | Total |
|----------|------------|-------------|-------|
| Anthropic | ~$3.60 | ~$0.60 | **~$4.20** |
| OpenAI | ~$12 | ~$2 | **~$14** |
| Gemini | ~$0.60 | ~$0.10 | **~$0.70** |

**Recommendation**: Anthropic for best quality/cost balance.

---

## 🎯 Production Checklist

Before announcing to team:

- [ ] Backend deployed to Vercel
- [ ] Environment variables configured
- [ ] `/ping` endpoint responds successfully
- [ ] `/process` endpoint tested with real article
- [ ] Chrome extension configured with production URL
- [ ] End-to-end test completed (capture → process → copy)
- [ ] Team members have AUTH_TOKENS
- [ ] Monitoring set up (Vercel Analytics)
- [ ] Documentation shared with team

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/devenspear/DisWeekly-PluginEngine
- **Anthropic Console**: https://console.anthropic.com/
- **OpenAI Dashboard**: https://platform.openai.com/
- **Gemini AI Studio**: https://makersuite.google.com/

---

## 📞 Support

If deployment fails:
1. Check Vercel build logs
2. Run `npm run build` locally first
3. Verify all environment variables are set
4. Test endpoints with curl

---

**Status**: Ready for deployment ✅
**Est. Deploy Time**: 5-10 minutes
**Next Step**: Run `git push` and connect to Vercel
