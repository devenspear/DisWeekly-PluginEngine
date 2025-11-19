// Simple in-memory metrics tracker
// Note: Resets on deployment. Future: migrate to database

interface MetricsData {
  totalArticlesProcessed: number;
  totalArticlesRejected: number;
  totalErrors: number;
  responseTimesMs: number[];
  lastProcessedAt?: string;
  startTime: string;
}

// Use globalThis to persist across warm starts in Edge Runtime
declare global {
  var metricsData: MetricsData | undefined;
}

class MetricsTracker {
  private get data(): MetricsData {
    if (!globalThis.metricsData) {
      globalThis.metricsData = {
        totalArticlesProcessed: 0,
        totalArticlesRejected: 0,
        totalErrors: 0,
        responseTimesMs: [],
        startTime: new Date().toISOString(),
      };
    }
    return globalThis.metricsData;
  }

  private set data(value: MetricsData) {
    globalThis.metricsData = value;
  }

  trackProcessing(responseTimeMs: number, status: "ok" | "reject" | "error") {
    this.data.responseTimesMs.push(responseTimeMs);
    this.data.lastProcessedAt = new Date().toISOString();

    if (status === "ok") {
      this.data.totalArticlesProcessed++;
    } else if (status === "reject") {
      this.data.totalArticlesRejected++;
    } else if (status === "error") {
      this.data.totalErrors++;
    }

    // Keep only last 100 response times to avoid memory issues
    if (this.data.responseTimesMs.length > 100) {
      this.data.responseTimesMs = this.data.responseTimesMs.slice(-100);
    }
  }

  getMetrics() {
    const responseTimes = this.data.responseTimesMs;
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const minResponseTime = responseTimes.length > 0
      ? Math.min(...responseTimes)
      : 0;

    const maxResponseTime = responseTimes.length > 0
      ? Math.max(...responseTimes)
      : 0;

    const uptime = Date.now() - new Date(this.data.startTime).getTime();

    return {
      totalArticlesProcessed: this.data.totalArticlesProcessed,
      totalArticlesRejected: this.data.totalArticlesRejected,
      totalErrors: this.data.totalErrors,
      totalRequests: this.data.totalArticlesProcessed + this.data.totalArticlesRejected + this.data.totalErrors,
      avgResponseTimeMs: Math.round(avgResponseTime),
      minResponseTimeMs: minResponseTime,
      maxResponseTimeMs: maxResponseTime,
      lastProcessedAt: this.data.lastProcessedAt,
      startTime: this.data.startTime,
      uptimeMs: uptime,
      recentResponseTimes: responseTimes.slice(-10), // Last 10 requests
    };
  }

  reset() {
    globalThis.metricsData = {
      totalArticlesProcessed: 0,
      totalArticlesRejected: 0,
      totalErrors: 0,
      responseTimesMs: [],
      startTime: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const metrics = new MetricsTracker();
