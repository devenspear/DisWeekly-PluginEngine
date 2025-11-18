# 🔒 Fix: Vercel Deployment Protection Blocking API

## Problem

Vercel Deployment Protection is enabled, blocking the Chrome Extension from accessing the API.

The API returns HTML authentication pages instead of JSON responses.

---

## Solution: Disable Deployment Protection

### Step 1: Go to Vercel Dashboard

```
https://vercel.com/deven-projects/disweekly-backend/settings/deployment-protection
```

### Step 2: Disable Protection

1. Under **"Deployment Protection"** section
2. Select **"Disabled"** or **"Standard Protection Only"**
3. Click **"Save"**

---

## Alternative: Use Production Domain

If you want to keep protection enabled:

### Option A: Assign Production Domain

1. Go to: https://vercel.com/deven-projects/disweekly-backend/settings/domains
2. Add a custom domain (e.g., `api.disruptionweekly.com`)
3. Production domains bypass deployment protection
4. Update Chrome Extension with new domain

### Option B: Use Vercel Production URL

Get the actual production URL (not preview URL):

```bash
npx vercel ls --prod
```

Look for URL without hash (e.g., `disweekly-backend.vercel.app` instead of `disweekly-backend-5lo7acz5b-deven-projects.vercel.app`)

---

## Quick Fix (Recommended)

**Disable Deployment Protection for API projects:**

1. **Go to Settings**:
   ```
   https://vercel.com/deven-projects/disweekly-backend/settings/deployment-protection
   ```

2. **Set to "Disabled"**:
   - This allows the API to be publicly accessible
   - Your AUTH_TOKENS still provide security
   - Chrome Extension can connect

3. **Save**

4. **Test immediately** - no redeploy needed:
   ```bash
   curl -H "Authorization: Bearer b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011" \
     https://disweekly-backend-5lo7acz5b-deven-projects.vercel.app/api/url-writer/ping
   ```

5. **Test in Extension**:
   - Click "Test Connection" button
   - Should see ✅ Success

---

## Why This Happens

Vercel enables **Deployment Protection** by default on new projects to prevent unauthorized access to preview deployments.

However, for API endpoints that need to be publicly accessible (protected by your own auth tokens), you should disable this feature.

---

## Security Note

Disabling Vercel Deployment Protection is safe because:
- ✅ Your API has its own authentication (AUTH_TOKENS)
- ✅ Only requests with valid Bearer tokens can process articles
- ✅ Public endpoints (like health check) are intentionally public
- ✅ No sensitive data is exposed without auth

---

## After Fixing

Once deployment protection is disabled:

1. Test the health check:
   ```bash
   curl -H "Authorization: Bearer b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011" \
     https://disweekly-backend-5lo7acz5b-deven-projects.vercel.app/api/url-writer/ping
   ```

2. Should see:
   ```json
   {
     "status": "ok",
     "message": "Disruption Weekly URL Writer API is running",
     "timestamp": "2025-11-17T..."
   }
   ```

3. In Chrome Extension:
   - Click "Test Connection"
   - Should see success ✅
   - Click "Save Settings"

4. Test on real article:
   - Navigate to any article
   - Click extension icon
   - Should process successfully

---

**Status**: Waiting for deployment protection to be disabled
**Next**: Test connection in Chrome Extension
