-- Optional database schema for storing processed articles
-- This is not required for the API to function
-- Use this if you want to persist and track processed articles

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Input metadata
  estimated_word_count INTEGER,
  client TEXT,
  user_agent TEXT,

  -- LLM Output
  headline_primary TEXT NOT NULL,
  headline_secondary TEXT NOT NULL,
  bullets TEXT[] NOT NULL,

  -- Validation results
  actual_word_count INTEGER,
  bullets_count INTEGER,
  headlines_word_counts INTEGER[],
  bullets_word_counts INTEGER[],
  source_purity_passed BOOLEAN,

  -- Status
  status TEXT NOT NULL DEFAULT 'ok',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast URL lookups
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_articles_processed_at ON articles(processed_at DESC);

-- Index for source domain analytics
CREATE INDEX IF NOT EXISTS idx_articles_source_domain ON articles(source_domain);

-- View for recent articles
CREATE OR REPLACE VIEW recent_articles AS
SELECT
  id,
  url,
  title,
  source_domain,
  headline_primary,
  headline_secondary,
  bullets,
  processed_at
FROM articles
WHERE status = 'ok'
ORDER BY processed_at DESC
LIMIT 100;

-- View for article analytics
CREATE OR REPLACE VIEW article_stats AS
SELECT
  source_domain,
  COUNT(*) as total_articles,
  AVG(estimated_word_count) as avg_word_count,
  MIN(processed_at) as first_processed,
  MAX(processed_at) as last_processed
FROM articles
WHERE status = 'ok'
GROUP BY source_domain
ORDER BY total_articles DESC;
