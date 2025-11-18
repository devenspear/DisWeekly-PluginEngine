// Optional database persistence layer
// Uncomment and configure if you want to store processed articles

/*
import { Pool } from 'pg';
import type { ArticleRecord } from '@/types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveArticle(article: ArticleRecord): Promise<void> {
  const query = `
    INSERT INTO articles (
      id, url, title, source_domain, processed_at,
      estimated_word_count, client,
      headline_primary, headline_secondary, bullets,
      actual_word_count, bullets_count,
      headlines_word_counts, bullets_word_counts,
      source_purity_passed, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (url) DO UPDATE SET
      processed_at = EXCLUDED.processed_at,
      headline_primary = EXCLUDED.headline_primary,
      headline_secondary = EXCLUDED.headline_secondary,
      bullets = EXCLUDED.bullets,
      updated_at = NOW()
  `;

  await pool.query(query, [
    article.id,
    article.url,
    article.title,
    article.sourceDomain,
    article.processedAt,
    article.validation.wordCount,
    'chrome-extension',
    article.output.headlinePrimary,
    article.output.headlineSecondary,
    article.output.bullets,
    article.validation.wordCount,
    article.validation.bulletsCount,
    article.validation.headlinesWordCounts,
    article.validation.bulletsWordCounts,
    article.validation.sourcePurityChecksPassed,
    'ok',
  ]);
}

export async function getArticleByUrl(url: string): Promise<ArticleRecord | null> {
  const query = `
    SELECT * FROM articles WHERE url = $1
  `;

  const result = await pool.query(query, [url]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    sourceDomain: row.source_domain,
    processedAt: row.processed_at,
    output: {
      headlinePrimary: row.headline_primary,
      headlineSecondary: row.headline_secondary,
      bullets: row.bullets,
    },
    validation: {
      wordCount: row.actual_word_count,
      bulletsCount: row.bullets_count,
      headlinesWordCounts: row.headlines_word_counts,
      bulletsWordCounts: row.bullets_word_counts,
      sourcePurityChecksPassed: row.source_purity_passed,
    },
  };
}

export async function getRecentArticles(limit: number = 20): Promise<ArticleRecord[]> {
  const query = `
    SELECT * FROM articles
    WHERE status = 'ok'
    ORDER BY processed_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);

  return result.rows.map(row => ({
    id: row.id,
    url: row.url,
    title: row.title,
    sourceDomain: row.source_domain,
    processedAt: row.processed_at,
    output: {
      headlinePrimary: row.headline_primary,
      headlineSecondary: row.headline_secondary,
      bullets: row.bullets,
    },
    validation: {
      wordCount: row.actual_word_count,
      bulletsCount: row.bullets_count,
      headlinesWordCounts: row.headlines_word_counts,
      bulletsWordCounts: row.bullets_word_counts,
      sourcePurityChecksPassed: row.source_purity_passed,
    },
  }));
}
*/

// Placeholder export if database is not configured
export const DB_ENABLED = false;
