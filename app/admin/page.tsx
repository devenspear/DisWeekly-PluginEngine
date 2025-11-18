"use client";

import { useEffect, useState } from "react";

interface Metrics {
  totalArticlesProcessed: number;
  totalArticlesRejected: number;
  totalErrors: number;
  totalRequests: number;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  lastProcessedAt?: string;
  startTime: string;
  uptimeMs: number;
  recentResponseTimes: number[];
}

interface Config {
  systemPrompt: string;
  llmProvider: string;
  model: string;
  hasCustomSystemPrompt: boolean;
  environment: {
    hasAnthropicKey: boolean;
    hasOpenAIKey: boolean;
    hasGeminiKey: boolean;
  };
}

export default function AdminPage() {
  const [authToken, setAuthToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!authToken) {
      setError("Please enter auth token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const [metricsRes, configRes] = await Promise.all([
        fetch("/api/admin/metrics", { headers }),
        fetch("/api/admin/config", { headers }),
      ]);

      if (!metricsRes.ok || !configRes.ok) {
        throw new Error("Authentication failed");
      }

      const metricsData = await metricsRes.json();
      const configData = await configRes.json();

      setMetrics(metricsData.metrics);
      setConfig(configData.config);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Disruption Weekly - Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Processing Engine Configuration & Monitoring
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white shadow sm:rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Authentication Required
            </h2>
            <input
              type="password"
              placeholder="Enter Auth Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchData()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Access Dashboard"}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metrics Section */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  📊 Performance Metrics
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time statistics (resets on deployment)
                </p>
              </div>
              <div className="px-6 py-5">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        Processed
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {metrics.totalArticlesProcessed}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">
                        Rejected
                      </p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {metrics.totalArticlesRejected}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Errors</p>
                      <p className="text-2xl font-bold text-red-900">
                        {metrics.totalErrors}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">
                        Total Requests
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {metrics.totalRequests}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">
                        Avg Response Time
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {metrics.avgResponseTimeMs}ms
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-indigo-600 font-medium">
                        Min / Max
                      </p>
                      <p className="text-lg font-bold text-indigo-900">
                        {metrics.minResponseTimeMs}ms / {metrics.maxResponseTimeMs}ms
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">
                        Uptime
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatUptime(metrics.uptimeMs)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">
                        Last Processed
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        {metrics.lastProcessedAt
                          ? new Date(metrics.lastProcessedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  ⚙️ LLM Configuration
                </h2>
              </div>
              <div className="px-6 py-5">
                {config && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Provider
                      </p>
                      <p className="text-lg text-gray-900">
                        {config.llmProvider.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Model</p>
                      <p className="text-lg font-mono text-gray-900">
                        {config.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        API Keys Configured
                      </p>
                      <div className="flex gap-3">
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            config.environment.hasAnthropicKey
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {config.environment.hasAnthropicKey ? "✓" : "✗"}{" "}
                          Anthropic
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            config.environment.hasOpenAIKey
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {config.environment.hasOpenAIKey ? "✓" : "✗"} OpenAI
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            config.environment.hasGeminiKey
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {config.environment.hasGeminiKey ? "✓" : "✗"} Gemini
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Prompt Section */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    📝 System Prompt
                  </h2>
                  {config?.hasCustomSystemPrompt && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ Using custom prompt from CUSTOM_SYSTEM_PROMPT
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    config && copyToClipboard(config.systemPrompt)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Copy Prompt
                </button>
              </div>
              <div className="px-6 py-5">
                {config && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {config.systemPrompt}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                🔧 How to Edit Prompts
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>
                  Go to{" "}
                  <a
                    href="https://vercel.com/deven-projects/disweekly-backend/settings/environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Vercel Environment Variables
                  </a>
                </li>
                <li>
                  Add or update <code className="bg-blue-100 px-1 rounded">CUSTOM_SYSTEM_PROMPT</code>
                </li>
                <li>Paste your modified prompt</li>
                <li>Select "Production" environment</li>
                <li>Click "Save"</li>
                <li>
                  Redeploy:{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    npx vercel --prod --yes
                  </code>
                </li>
                <li>Refresh this page to see changes</li>
              </ol>
            </div>

            {/* Refresh Button */}
            <div className="flex gap-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setAuthToken("");
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
