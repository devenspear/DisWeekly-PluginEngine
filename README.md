# Disruption Weekly - Processing Engine (Backend)

Next.js API backend for the **Disruption Weekly URL Writer** workflow. This processes articles captured by the Chrome Extension and returns AI-generated headlines and bullets following strict Disruption Weekly formatting rules.

**GitHub Repository**: https://github.com/devenspear/DisWeekly-PluginEngine

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Organization](#project-organization)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Development](#development)
- [Database (Optional)](#database-optional)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

This backend serves as the **Processing Engine** for Disruption Weekly, implementing the **URL Writer LLM workflow** that:

1. Receives article content from the Chrome Extension
2. Processes it through AI (Anthropic Claude / OpenAI GPT / Google Gemini)
3. Returns structured output:
   - 2 headline options (≤12 words each)
   - 6 bullet points (11-16 words each)
   - Strict source purity (100% from article, zero hallucination)

### Key Features

✅ **Multi-LLM Support** - Works with Anthropic, OpenAI, or Gemini
✅ **Strict Validation** - Word count enforcement, format checking
✅ **Source Purity** - Anti-hallucination prompt engineering
✅ **Bearer Token Auth** - Secure API access
✅ **Edge Runtime** - Fast, globally distributed
✅ **Vercel Ready** - One-click deployment
✅ **Optional Database** - Persist processed articles

---

## Project Organization

### Directory Structure

```
disweekly-backend/
│
├── 📂 app/                          # Next.js App Router
│   ├── api/
│   │   └── url-writer/
│   │       ├── ping/
│   │       │   └── route.ts         # Health check endpoint
│   │       └── process/
│   │           └── route.ts         # Main processing endpoint
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
│
├── 📂 lib/                          # Core business logic
│   ├── auth.ts                      # Bearer token authentication
│   ├── llm-clients.ts               # LLM integrations (Anthropic/OpenAI/Gemini)
│   ├── prompts.ts                   # URL Writer prompt templates
│   ├── validation.ts                # Word count & format validation
│   ├── db.ts                        # Database layer (optional)
│   └── database.sql                 # SQL schema (optional)
│
├── 📂 types/                        # TypeScript definitions
│   └── index.ts                     # Shared types
│
├── 📄 .env.example                  # Environment variables template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 next.config.js                # Next.js configuration
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vercel.json                   # Vercel deployment config
└── 📄 README.md                     # This file
```

---

## Architecture

### System Flow

```
Chrome Extension
       ↓
  [Capture Article]
       ↓
POST /api/url-writer/process
       ↓
  [Validate Auth]
       ↓
  [Validate Content]
       ↓
  [LLM Processing]
   (Anthropic/OpenAI/Gemini)
       ↓
  [Validate Output]
       ↓
  [Return JSON]
       ↓
Chrome Extension
```

### Components

#### **1. API Layer** (`app/api/url-writer/`)
- **`/ping`** - Health check + auth validation
- **`/process`** - Main article processing

#### **2. LLM Clients** (`lib/llm-clients.ts`)
- Anthropic Claude (Sonnet 3.5)
- OpenAI GPT-4 Turbo
- Google Gemini Pro
- Auto-selects based on available API keys

#### **3. Prompt Engineering** (`lib/prompts.ts`)
- URL Writer system prompt (from PRD)
- User prompt builder
- Response parser

#### **4. Validation** (`lib/validation.ts`)
- Article content validation (≥400 words)
- Headline validation (≤12 words)
- Bullet validation (11-16 words, exactly 6)
- Output format checking

#### **5. Authentication** (`lib/auth.ts`)
- Bearer token validation
- Multi-token support
- Token generation utilities

---

## API Endpoints

### `GET /api/url-writer/ping`

Health check endpoint. Validates authentication.

**Request:**
```http
GET /api/url-writer/ping
Authorization: Bearer your-token-here
```

**Response (Success):**
```json
{
  "status": "ok",
  "message": "Disruption Weekly URL Writer API is running",
  "timestamp": "2025-11-17T22:00:00Z"
}
```

**Response (Unauthorized):**
```json
{
  "status": "error",
  "reason": "authentication_failed",
  "details": "Invalid authentication token"
}
```

---

### `POST /api/url-writer/process`

Processes an article and returns headlines + bullets.

**Request:**
```http
POST /api/url-writer/process
Authorization: Bearer your-token-here
Content-Type: application/json

{
  "url": "https://example.com/article",
  "title": "Article Title",
  "sourceDomain": "example.com",
  "body": "Full article text here...",
  "client": "chrome-extension",
  "meta": {
    "userAgent": "Mozilla/5.0...",
    "capturedAt": "2025-11-17T22:00:00Z",
    "estimatedWordCount": 1200
  }
}
```

**Response (Success):**
```json
{
  "status": "ok",
  "articleId": "550e8400-e29b-41d4-a716-446655440000",
  "output": {
    "headlinePrimary": "**Bold headline option one (≤12 words)**",
    "headlineSecondary": "**Bold headline option two (≤12 words)**",
    "bullets": [
      "First bullet, 11-16 words, business-focused, straight from article text only.",
      "Second bullet, 11-16 words, strategic implications for decision makers here.",
      "Third bullet, 11-16 words, key metrics or adoption stats from article.",
      "Fourth bullet, 11-16 words, regulatory or market context as stated.",
      "Fifth bullet, 11-16 words, funding or partnership details mentioned explicitly.",
      "Sixth bullet, 11-16 words, clear implications or impact from source."
    ],
    "url": "https://example.com/article"
  },
  "validation": {
    "wordCount": 1200,
    "bulletsCount": 6,
    "headlinesWordCounts": [10, 11],
    "bulletsWordCounts": [14, 13, 12, 15, 16, 11],
    "sourcePurityChecksPassed": true
  }
}
```

**Response (Rejection):**
```json
{
  "status": "reject",
  "reason": "article_too_short",
  "details": "Article has only 250 words (min 400)"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "reason": "processing_failed",
  "details": "Error message here"
}
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- LLM API key (Anthropic / OpenAI / Gemini)
- Vercel account (for deployment)

### Local Development Setup

```bash
# Clone the repository
cd /Users/devenspear/VibeCodingProjects/disweekly-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# - Add LLM API key
# - Generate auth tokens
# - Set LLM provider

# Run development server
npm run dev
```

Server starts at: `http://localhost:3000`

---

## Configuration

### Environment Variables

Create `.env.local` (never commit this file):

```bash
# LLM Provider (choose one)
LLM_PROVIDER=anthropic

# API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here

# Authentication Tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_TOKENS=token1,token2,token3

# Optional: Database
DATABASE_URL=postgres://user:pass@host:5432/db
```

### Generate Auth Tokens

```bash
# Generate a secure random token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use the built-in generator
node -p "require('./lib/auth').generateToken()"
```

Add generated tokens to `.env.local`:
```
AUTH_TOKENS=abc123...,def456...,ghi789...
```

---

## Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - ANTHROPIC_API_KEY
# - AUTH_TOKENS
# - LLM_PROVIDER
```

#### Option 2: GitHub Integration

1. Push code to GitHub: `https://github.com/devenspear/DisWeekly-PluginEngine`
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

#### Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add:
- `LLM_PROVIDER` = `anthropic`
- `ANTHROPIC_API_KEY` = `sk-ant-...`
- `AUTH_TOKENS` = `token1,token2`

### Production URL

After deployment, your API will be at:
```
https://your-project.vercel.app/api/url-writer/process
```

Update this URL in the Chrome Extension settings.

---

## Development

### Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Adding a New LLM Provider

1. Add provider client in `lib/llm-clients.ts`:
```typescript
export async function processWithNewProvider(article) {
  // Implementation
}
```

2. Update `processArticle()` function to include new provider

3. Update `.env.example` with new API key

4. Test with real article

### Modifying the Prompt

Edit `lib/prompts.ts`:

```typescript
export const URL_WRITER_SYSTEM_PROMPT = `
  Your updated prompt here...
`;
```

Redeploy to Vercel. Extension users can click "Regenerate" to use updated prompt.

---

## Database (Optional)

The backend works without a database. To persist processed articles:

### Setup PostgreSQL

```bash
# Install pg package
npm install pg @types/pg

# Set DATABASE_URL in .env.local
DATABASE_URL=postgres://user:pass@host:5432/disweekly

# Run schema
psql $DATABASE_URL < lib/database.sql
```

### Enable Database in Code

Uncomment database code in:
- `lib/db.ts` - Database functions
- `app/api/url-writer/process/route.ts` - Save articles after processing

### Database Features

Once enabled:
- ✅ Persistent article storage
- ✅ Duplicate detection
- ✅ Analytics views (source domain stats)
- ✅ Recent articles API

---

## Testing

### Test Health Check

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-app.vercel.app/api/url-writer/ping
```

### Test Processing

```bash
curl -X POST https://your-app.vercel.app/api/url-writer/process \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://techcrunch.com/some-article",
    "title": "Test Article",
    "sourceDomain": "techcrunch.com",
    "body": "Article content here (≥400 words)...",
    "client": "chrome-extension",
    "meta": {
      "userAgent": "Test",
      "capturedAt": "2025-11-17T22:00:00Z",
      "estimatedWordCount": 500
    }
  }'
```

### Test with Chrome Extension

1. Deploy backend to Vercel
2. Get production URL
3. Open Chrome Extension settings
4. Enter:
   - Backend URL: `https://your-app.vercel.app`
   - Auth Token: (one from AUTH_TOKENS)
5. Click "Test Connection" → should see success
6. Navigate to an article, click extension icon

---

## Troubleshooting

### "No LLM API key configured"

**Solution**: Add at least one API key to environment variables:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key
```

### "Invalid authentication token"

**Solution**:
1. Check AUTH_TOKENS is set in Vercel
2. Verify token in extension matches one in AUTH_TOKENS
3. Tokens are comma-separated: `token1,token2,token3`

### "Article validation failed: too short"

**Cause**: Article has <400 words
**Solution**: Try a longer article (news, blog, technical)

### "LLM output validation failed"

**Cause**: LLM didn't follow format (rare)
**Solution**:
1. Check LLM API is responding correctly
2. Try regenerating
3. Check prompt in `lib/prompts.ts`

### Vercel deployment fails

**Solution**:
1. Check `package.json` has all dependencies
2. Run `npm run build` locally first
3. Check Vercel build logs for specific errors

### Extension can't reach backend

**Solution**:
1. Verify backend URL (no trailing slash)
2. Check CORS if needed (should work by default)
3. Test `/ping` endpoint manually with curl
4. Check Vercel function logs

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success - article processed |
| 400 | Validation failed (article too short, etc.) |
| 401 | Unauthorized (invalid/missing token) |
| 500 | Server error (LLM failure, etc.) |

---

## Security

✅ **No API keys in extension** - Keys stay server-side
✅ **Bearer token auth** - Secure token validation
✅ **Environment variables** - Secrets in Vercel env
✅ **Edge runtime** - Fast, isolated execution
✅ **Rate limiting** - Built into Vercel

---

## Performance

- **Typical response time**: 10-30 seconds (LLM-dependent)
- **Max function duration**: 60 seconds
- **Edge deployment**: Global CDN, low latency
- **Cold start**: <1 second (Edge Runtime)

---

## Roadmap

Future enhancements:
- [ ] Multiple LLM provider fallback
- [ ] Caching for repeated URLs
- [ ] Batch processing API
- [ ] Analytics dashboard
- [ ] Webhook notifications
- [ ] Rate limiting per token
- [ ] Article quality scoring

---

## Support

**Repository**: https://github.com/devenspear/DisWeekly-PluginEngine

For issues:
1. Check logs in Vercel dashboard
2. Test endpoints with curl
3. Verify environment variables
4. Check Chrome Extension network tab

---

## License

Proprietary - Disruption Weekly

---

**Built with**: Next.js 14, TypeScript, Anthropic Claude / OpenAI / Gemini
**Deployment**: Vercel Edge Runtime
**Status**: ✅ Production Ready
