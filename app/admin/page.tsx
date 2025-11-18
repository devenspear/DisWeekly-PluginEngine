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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Disruption Weekly
            </h1>
            <p className="mt-2 text-lg text-gray-600 font-medium">
              Admin Dashboard - Processing Engine Configuration & Monitoring
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md mx-auto border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-sm text-gray-500">
                Enter your API token to access the dashboard
              </p>
            </div>
            <input
              type="password"
              placeholder="Enter Auth Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchData()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all"
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metrics Section */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performance Metrics
                </h2>
                <p className="mt-1 text-blue-100">
                  Real-time statistics (resets on deployment)
                </p>
              </div>
              <div className="px-8 py-8">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">
                          Processed
                        </p>
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-green-900">
                        {metrics.totalArticlesProcessed}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Successfully analyzed</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl shadow-md border border-yellow-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-700 font-semibold uppercase tracking-wide">
                          Rejected
                        </p>
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-900">
                        {metrics.totalArticlesRejected}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Validation failures</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl shadow-md border border-red-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-red-700 font-semibold uppercase tracking-wide">Errors</p>
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-red-900">
                        {metrics.totalErrors}
                      </p>
                      <p className="text-xs text-red-600 mt-1">Processing failures</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide">
                          Total Requests
                        </p>
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-900">
                        {metrics.totalRequests}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">All API calls</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-700 font-semibold uppercase tracking-wide">
                          Avg Response
                        </p>
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-purple-900">
                        {metrics.avgResponseTimeMs}<span className="text-lg">ms</span>
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Average processing time</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-indigo-700 font-semibold uppercase tracking-wide">
                          Min / Max
                        </p>
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-indigo-900">
                        {metrics.minResponseTimeMs} / {metrics.maxResponseTimeMs}<span className="text-sm">ms</span>
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">Response time range</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-700 font-semibold uppercase tracking-wide">
                          Uptime
                        </p>
                        <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatUptime(metrics.uptimeMs)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Since deployment</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-700 font-semibold uppercase tracking-wide">
                          Last Processed
                        </p>
                        <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm font-mono text-slate-900 font-semibold">
                        {metrics.lastProcessedAt
                          ? new Date(metrics.lastProcessedAt).toLocaleString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">Most recent article</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  LLM Configuration
                </h2>
              </div>
              <div className="px-8 py-8">
                {config && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                            Provider
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {config.llmProvider.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Model</p>
                          <p className="text-lg font-mono font-bold text-purple-900">
                            {config.model}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        API Keys Configured
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.environment.hasAnthropicKey
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {config.environment.hasAnthropicKey ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className={`font-semibold ${config.environment.hasAnthropicKey ? "text-green-900" : "text-gray-500"}`}>
                              Anthropic
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.environment.hasOpenAIKey
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {config.environment.hasOpenAIKey ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className={`font-semibold ${config.environment.hasOpenAIKey ? "text-green-900" : "text-gray-500"}`}>
                              OpenAI
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.environment.hasGeminiKey
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {config.environment.hasGeminiKey ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className={`font-semibold ${config.environment.hasGeminiKey ? "text-green-900" : "text-gray-500"}`}>
                              Gemini
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Prompt Section */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    System Prompt
                  </h2>
                  {config?.hasCustomSystemPrompt && (
                    <p className="mt-1 text-emerald-100 flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Using custom prompt from CUSTOM_SYSTEM_PROMPT
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    config && copyToClipboard(config.systemPrompt)
                  }
                  className="px-5 py-2.5 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Prompt
                </button>
              </div>
              <div className="px-8 py-8">
                {config && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 overflow-auto max-h-96 border-2 border-gray-200 shadow-inner">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                      {config.systemPrompt}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    How to Edit Prompts
                  </h3>
                  <p className="text-blue-700 mb-6">
                    Follow these steps to customize your system prompt
                  </p>
                  <ol className="space-y-3 text-sm text-blue-900">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <span>
                        Go to{" "}
                        <a
                          href="https://vercel.com/deven-projects/disweekly-backend/settings/environment-variables"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold hover:text-blue-700"
                        >
                          Vercel Environment Variables
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <span>
                        Add or update{" "}
                        <code className="bg-blue-200 px-2 py-0.5 rounded font-mono font-semibold">
                          CUSTOM_SYSTEM_PROMPT
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <span className="font-medium">Paste your modified prompt</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <span className="font-medium">Select "Production" environment</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        5
                      </span>
                      <span className="font-medium">Click "Save"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        6
                      </span>
                      <span>
                        Redeploy:{" "}
                        <code className="bg-blue-200 px-2 py-0.5 rounded font-mono text-xs">
                          npx vercel --prod --yes
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        7
                      </span>
                      <span className="font-medium">Refresh this page to see changes</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setAuthToken("");
                }}
                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl hover:from-gray-700 hover:to-slate-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
