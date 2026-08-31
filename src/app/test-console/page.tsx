"use client";

import { useState } from "react";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Loader2,
  Youtube,
  Facebook,
  Instagram,
  BarChart3,
  Search,
  RefreshCw,
  Globe,
} from "lucide-react";

interface TestResult {
  platform: string;
  status: "success" | "error" | "warning" | "skipped";
  message: string;
  messageAr: string;
  data?: Record<string, any>;
  error?: string;
  responseTime?: number;
}

interface TestResponse {
  success: boolean;
  timestamp: string;
  results: TestResult[];
  summary: {
    total: number;
    success: number;
    error: number;
    warning: number;
    skipped: number;
  };
}

const platformIcons: Record<string, React.ElementType> = {
  "YouTube": Youtube,
  "TikTok": Globe,
  "Facebook": Facebook,
  "Instagram": Instagram,
  "Google Analytics": BarChart3,
  "Search Console": Search,
};

const platformColors: Record<string, string> = {
  "YouTube": "text-red-500",
  "TikTok": "text-pink-500",
  "Facebook": "text-blue-600",
  "Instagram": "text-purple-500",
  "Google Analytics": "text-yellow-500",
  "Search Console": "text-green-500",
};

export default function TestConsolePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResponse | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const runTests = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/test-console", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({
        success: false,
        timestamp: new Date().toISOString(),
        results: [],
        summary: { total: 0, success: 0, error: 1, warning: 0, skipped: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gold-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <Controls 
          loading={loading} 
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          onRunTests={runTests}
        />
        {results && <Summary summary={results.summary} />}
        {results && <ResultsList results={results.results} />}
        {!results && !loading && <EmptyState />}
        {loading && <LoadingState />}
        <Footer timestamp={results?.timestamp} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Globe className="w-8 h-8 text-gold-400" />
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
          Live API Test Console
        </h1>
      </div>
      <p className="text-dark-300 text-sm md:text-base">
        اختبر اتصال جميع المنصات والخدمات الخارجية بنجاح
      </p>
      <p className="text-dark-400 text-xs mt-1">
        Test real connections to YouTube, TikTok, Facebook, Instagram & Google services
      </p>
    </div>
  );
}

function Summary({ summary }: { summary: TestResponse["summary"] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-dark-800/60 border border-gold-500/10 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-white">{summary.total}</p>
        <p className="text-xs text-dark-400">Total Tests</p>
      </div>
      <div className="bg-dark-800/60 border border-green-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-green-400">{summary.success}</p>
        <p className="text-xs text-dark-400">Connected</p>
      </div>
      <div className="bg-dark-800/60 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-red-400">{summary.error}</p>
        <p className="text-xs text-dark-400">Failed</p>
      </div>
      <div className="bg-dark-800/60 border border-yellow-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-yellow-400">{summary.warning}</p>
        <p className="text-xs text-dark-400">Warnings</p>
      </div>
    </div>
  );
}

function ResultsList({ results }: { results: TestResult[] }) {
  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <ResultCard key={index} result={result} />
      ))}
    </div>
  );
}

function Controls({ 
  loading, 
  selectedPlatform, 
  onPlatformChange, 
  onRunTests 
}: {
  loading: boolean;
  selectedPlatform: string;
  onPlatformChange: (v: string) => void;
  onRunTests: () => void;
}) {
  return (
    <div className="bg-dark-800/60 border border-gold-500/10 rounded-2xl p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <select
          value={selectedPlatform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="flex-1 md:w-48 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold-500"
        >
          <option value="all">All Platforms (الكل)</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google Analytics</option>
          <option value="search-console">Search Console</option>
        </select>
        <button
          onClick={onRunTests}
          disabled={loading}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark-950 font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
          ) : (
            <><Play className="w-4 h-4" /> Run Live Tests</>
          )}
        </button>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: TestResult }) {
  const Icon = platformIcons[result.platform] || Globe;
  const color = platformColors[result.platform] || "text-gold-400";
  const statusIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    skipped: <Clock className="w-5 h-5 text-gray-400" />,
  }[result.status];
  const statusStyle = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    skipped: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  }[result.status];
  const statusLabel = { success: "Connected", error: "Failed", warning: "Warning", skipped: "Skipped" }[result.status];

  return (
    <div className="bg-dark-800/60 border border-gold-500/10 rounded-2xl p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{result.platform}</h3>
            <p className="text-xs text-dark-400">{result.messageAr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyle}`}>{statusLabel}</span>
        </div>
      </div>
      {result.data && (
        <div className="mt-4 bg-dark-900/50 rounded-lg p-3">
          <p className="text-xs text-dark-400 mb-2">Response Data:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(result.data).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-dark-500">{key}:</span>{" "}
                <span className="text-gold-300">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-xs text-red-400"><span className="font-semibold">Error:</span> {result.error}</p>
        </div>
      )}
      {result.responseTime && (
        <div className="mt-3 flex items-center gap-2 text-xs text-dark-500">
          <Clock className="w-3 h-3" /> Response time: {result.responseTime}ms
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <RefreshCw className="w-16 h-16 text-dark-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-dark-400 mb-2">Ready to Test</h3>
      <p className="text-sm text-dark-500">Click &quot;Run Live Tests&quot; to check all API connections</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-16">
      <Loader2 className="w-16 h-16 text-gold-500 mx-auto mb-4 animate-spin" />
      <h3 className="text-lg font-semibold text-gold-300 mb-2">Testing Connections...</h3>
      <p className="text-sm text-dark-400">Sending real requests to all platforms</p>
    </div>
  );
}

function Footer({ timestamp }: { timestamp?: string }) {
  return (
    <div className="mt-8 text-center text-xs text-dark-500">
      <p>Last test: {timestamp ? new Date(timestamp).toLocaleString() : "Never"}</p>
    </div>
  );
}


