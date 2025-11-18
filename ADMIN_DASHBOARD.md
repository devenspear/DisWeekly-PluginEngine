# 🔧 Admin Dashboard - Disruption Weekly Backend

**Live URL**: https://disweekly-backend.vercel.app/admin

---

## Features

### 📊 Real-Time Metrics
Track your API usage and performance:
- **Articles Processed** - Successfully analyzed articles
- **Articles Rejected** - Failed validation (< 400 words, etc.)
- **Errors** - Processing failures
- **Total Requests** - Overall API usage
- **Avg Response Time** - Average processing duration
- **Min/Max Response** - Fastest and slowest requests
- **Uptime** - Time since last deployment
- **Last Processed** - Timestamp of most recent article

### ⚙️ LLM Configuration
View your current setup:
- **Provider** - Anthropic, OpenAI, or Gemini
- **Model** - Which model is being used
- **API Keys** - Status of configured keys

### 📝 System Prompt Management
- **View Current Prompt** - See the exact prompt being sent to the LLM
- **Copy Functionality** - One-click copy for editing
- **Custom Prompt Indicator** - Shows if using custom vs default prompt

### 🔐 Authentication
- Protected by the same auth token as your API
- Use your existing token: `b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011`

---

## How to Access

1. Go to: https://disweekly-backend.vercel.app/admin
2. Enter your auth token: `b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011`
3. Click "Access Dashboard"

---

## How to Edit Prompts

The system prompt controls how Claude processes articles. To customize it:

### Step 1: Copy Current Prompt
1. Access the admin dashboard
2. Scroll to "System Prompt" section
3. Click "Copy Prompt" button

### Step 2: Edit Prompt
Edit the prompt to your needs. For example:
- Change tone or style instructions
- Adjust word count requirements
- Modify output format
- Add or remove quality checks

### Step 3: Save to Vercel
1. Go to: https://vercel.com/deven-projects/disweekly-backend/settings/environment-variables
2. Click "Add New" variable
3. Set:
   - **Key**: `CUSTOM_SYSTEM_PROMPT`
   - **Value**: Your modified prompt
   - **Environment**: Production
4. Click "Save"

### Step 4: Redeploy
```bash
cd /Users/devenspear/VibeCodingProjects/disweekly-backend
npx vercel --prod --yes
```

### Step 5: Verify
1. Refresh the admin dashboard
2. Check that "✓ Using custom prompt" appears
3. Verify your changes in the System Prompt section

---

## Metrics Details

### What's Tracked
- Every `/api/url-writer/process` request is tracked
- Response time measured from request start to completion
- Status tracked: `ok`, `reject`, or `error`

### Metrics Storage
- **Current**: In-memory (resets on deployment)
- **Future**: Database storage for persistent history

### Important Notes
⚠️ **Metrics reset when you redeploy**. This is temporary until database integration.

To preserve metrics across deployments, we'll need to add:
- Vercel KV (Redis) for real-time metrics
- PostgreSQL for article history
- Detailed logs and analytics

---

## API Endpoints

### Get Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://disweekly-backend.vercel.app/api/admin/metrics
```

**Response**:
```json
{
  "status": "ok",
  "metrics": {
    "totalArticlesProcessed": 5,
    "totalArticlesRejected": 2,
    "totalErrors": 1,
    "totalRequests": 8,
    "avgResponseTimeMs": 12500,
    "minResponseTimeMs": 8200,
    "maxResponseTimeMs": 18900,
    "lastProcessedAt": "2025-11-18T14:30:00Z",
    "startTime": "2025-11-18T14:00:00Z",
    "uptimeMs": 1800000,
    "recentResponseTimes": [12000, 13500, 11200, ...]
  }
}
```

### Get Configuration
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://disweekly-backend.vercel.app/api/admin/config
```

**Response**:
```json
{
  "status": "ok",
  "config": {
    "systemPrompt": "You are Disruption Weekly Scout...",
    "llmProvider": "anthropic",
    "model": "claude-3-opus-20240229",
    "hasCustomSystemPrompt": false,
    "environment": {
      "hasAnthropicKey": true,
      "hasOpenAIKey": false,
      "hasGeminiKey": false
    }
  }
}
```

---

## Prompt Engineering Tips

When editing the system prompt, consider:

### 1. **Source Purity Rules**
Keep the anti-hallucination instructions strong. These prevent Claude from:
- Adding external context
- Speculating beyond the article
- Refusing to process valid content

### 2. **Word Count Requirements**
Current: Headlines ≤12 words, Bullets 11-16 words
- Can be adjusted based on your newsletter style
- Ensure validation logic matches (`lib/validation.ts`)

### 3. **Tone and Audience**
Current: SMB/mid-market leaders, innovation execs
- Adjust for your specific audience
- Change emphasis (business vs technical, etc.)

### 4. **Output Format**
Current: Plain text with markdown bold
- Can request different formats
- Ensure parser handles new format (`lib/prompts.ts`)

### 5. **Quality Checks**
Current: Source purity, word counts, format validation
- Add domain-specific checks
- Industry-specific requirements

---

## Future Enhancements

### Phase 2: Database Integration
- **Article History**: Store all processed articles
- **User Sessions**: Track Chrome Extension usage
- **Analytics**: Trends, popular domains, processing patterns
- **Persistent Metrics**: Never lose stats on deployment

### Phase 3: Advanced Features
- **A/B Testing**: Compare different prompts
- **Custom Models**: Switch between Claude/GPT per request
- **Rate Limiting**: Per-token usage limits
- **Webhooks**: Notify on errors or rejections
- **Batch Processing**: Handle multiple articles

### Phase 4: Team Features
- **Multiple Users**: Team auth tokens
- **Activity Logs**: Who processed what
- **Shared Prompts**: Team-approved templates
- **Review Queue**: Approve/reject before sending

---

## Troubleshooting

### Metrics Showing Zero
- Metrics reset on deployment
- Process some articles to populate data

### Custom Prompt Not Showing
- Verify `CUSTOM_SYSTEM_PROMPT` env var is set in Vercel
- Check it's set for "Production" environment
- Redeploy after adding

### Authentication Failed
- Ensure token matches `AUTH_TOKENS` env var
- Token: `b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011`

### Metrics Not Tracking
- Check that requests are going to `/api/url-writer/process`
- Verify they're completing (not timing out)
- Check Vercel logs for errors

---

## Security Notes

### Authentication
- Admin dashboard requires same token as API
- Token transmitted via Bearer auth
- HTTPS only (Vercel enforces this)

### Prompt Visibility
- System prompt is visible in admin (intentional)
- Contains no secrets or credentials
- Safe to share with team members

### Environment Variables
- API keys stored securely in Vercel
- Never exposed in admin dashboard
- Only shows presence (true/false), not actual keys

---

## Accessing Logs

### Vercel Dashboard
https://vercel.com/deven-projects/disweekly-backend

### CLI Logs
```bash
npx vercel logs https://disweekly-backend.vercel.app
```

### Filter Logs
Look for:
- `Processing article:` - Article processing started
- `Successfully processed article` - Success
- `Error processing article:` - Failures
- `Claude Opus response:` - Raw LLM output (for debugging)

---

## Quick Reference

| Feature | URL |
|---------|-----|
| **Admin Dashboard** | https://disweekly-backend.vercel.app/admin |
| **Home Page** | https://disweekly-backend.vercel.app |
| **Vercel Dashboard** | https://vercel.com/deven-projects/disweekly-backend |
| **Environment Variables** | https://vercel.com/deven-projects/disweekly-backend/settings/environment-variables |
| **GitHub Repo** | https://github.com/devenspear/DisWeekly-PluginEngine |

**Auth Token**: `b4b4853c2e490f79f76b1c6bcb93becfb3413b8b796835f1e2737f70fae35011`

---

**Built**: November 18, 2025
**Status**: ✅ Live and operational
**Version**: 1.1.0 (with admin dashboard)

🎯 Ready to monitor and configure your Disruption Weekly processing engine!
