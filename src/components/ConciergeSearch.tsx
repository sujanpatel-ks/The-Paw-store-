/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Sparkles, Globe, ArrowRight, CornerDownRight, ShieldCheck, HelpCircle, FileText, Loader2, BookOpen, ShieldAlert, RefreshCw, Activity, Key, Zap } from "lucide-react";

interface SearchResult {
  text: string;
  chunks: Array<{ title: string; uri: string }>;
  isFallback?: boolean;
  fallbackReason?: string;
  source?: string;
}

export default function ConciergeSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([
    "Curated styling recommendations for French Bulldogs in 2026",
    "Latest sustainable materials in luxury feline scratching posts"
  ]);

  const [diagStatus, setDiagStatus] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const runDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch("/api/diagnose-api");
      const data = await res.json();
      setDiagStatus(data);
    } catch (err: any) {
      setDiagStatus({
        status: "error",
        message: err.message || "Failed to reach diagnostics endpoint"
      });
    } finally {
      setDiagLoading(false);
    }
  };

  React.useEffect(() => {
    runDiagnostics();
  }, []);

  const presetQueries = [
    {
      title: "Canine Autumn Style",
      desc: "Curate high-end coat designs & styling tips for autumn 2026.",
      text: "Curated styling recommendations for French Bulldogs in 2026"
    },
    {
      title: "Ergonomic Feline Luxury",
      desc: "What are the latest luxury ergonomic cat bed designs verified by vets?",
      text: "Latest vet-approved ergonomic cat bed designs and materials"
    },
    {
      title: "Organic Gourmet Diets",
      desc: "Find organic, grain-free companion diets recommended in recent articles.",
      text: "Premium organic grain-free canine gourmet diets verified by recent veterinary articles"
    },
    {
      title: "Luxury Pet Spas",
      desc: "Top aesthetic pet boutique hotels & clinics in WA with modern architecture.",
      text: "Top aesthetic pet boutique hotels and veterinary clinics in Seattle WA with modern design"
    }
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await fetch("/api/search-grounding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve search results.");
      }

      setResult(data);
      
      // Update history
      setHistory((prev) => {
        const filtered = prev.filter((h) => h !== searchQuery);
        return [searchQuery, ...filtered].slice(0, 5);
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with the concierge server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Editorial Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1C1C1A] text-[#EAE5DB] rounded-full text-[10px] font-mono tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Low Latency AI (gemini-3.1-flash-lite) & Search Grounding</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-light text-brand-charcoal tracking-tight">
            Concierge <span className="font-semibold text-brand-terracotta">AI & Web Search</span>
          </h1>
          <p className="text-xs font-mono text-brand-charcoal/60 uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
            Harness real-time Google Search grounding to discover, verify, and consult the latest luxury companion styling, premium nutrition research, and global trends.
          </p>
        </div>

        {/* Dynamic Interactive Input Area */}
        <div className="bg-white border-2 border-double border-brand-charcoal/30 p-8 md:p-10 shadow-lg relative overflow-hidden transition-all duration-300">
          {/* Subtle design ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-0.5 bg-brand-terracotta/40 rotate-45 transform translate-x-8 translate-y-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <label className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/60 block font-bold mb-2">
              What exquisite companion topic would you like to investigate?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Find premium veterinary trends or luxury styling guides..."
                  className="w-full pl-11 pr-4 py-3.5 bg-brand-cream/20 border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-charcoal focus:bg-white transition-all placeholder:text-brand-charcoal/30 rounded-none text-brand-charcoal"
                  disabled={loading}
                />
                <Search className="absolute left-4 top-4 w-4 h-4 text-brand-charcoal/40" />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="py-3.5 px-8 bg-brand-charcoal hover:bg-brand-terracotta text-white font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-none disabled:opacity-40 disabled:hover:bg-brand-charcoal cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Searching Web...
                  </>
                ) : (
                  <>
                    Consult Concierge
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading reassurance panel */}
          {loading && (
            <div className="mt-8 border-t border-brand-warm-gray/60 pt-6 text-center space-y-4 animate-pulse relative z-10">
              <div className="flex justify-center">
                <div className="w-10 h-10 border-2 border-brand-terracotta/20 border-t-brand-terracotta rounded-full animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-terracotta font-semibold">
                  Engaging Live Grounding
                </p>
                <p className="text-[11px] text-brand-charcoal/60 font-light italic">
                  "Consulting Google search indices & synthesizing luxury answers..."
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-8 p-6 bg-[#FAF8F5] border-l-4 border-brand-terracotta shadow-xs space-y-3 transition-all duration-300 animate-fade-in relative z-10">
              <div className="flex items-center gap-3 text-brand-terracotta">
                <div className="p-1.5 bg-brand-terracotta/10 rounded-none">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  Concierge Connection Interrupted
                </span>
              </div>
              
              <div className="pl-11 space-y-2">
                <p className="text-xs text-brand-charcoal/80 leading-relaxed font-light">
                  The curated intelligence system experienced a communication notice: <strong className="font-mono font-normal text-brand-terracotta">{error}</strong>
                </p>
                <p className="text-[10px] font-mono text-brand-charcoal/50 leading-normal border-t border-brand-warm-gray/40 pt-2 uppercase tracking-wide">
                  💡 Operational Tip: Please verify that <strong className="text-brand-charcoal/70">GEMINI_API_KEY</strong> is securely entered under <span className="underline">Settings &gt; Secrets</span> on the builder dashboard to activate full-spectrum live search.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dual Layout: Results or Presets */}
        {result ? (
          <div className="space-y-8 animate-fade-in">
            {/* The Grounded Synthesized Response */}
            <div className="bg-white border border-brand-warm-gray/80 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-brand-cream pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-terracotta" />
                  <span className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                    Concierge Synthesis
                  </span>
                </div>
                
                {result.source !== "standard-generation" && result.source !== "offline-expert" ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-sage font-bold uppercase border border-brand-sage/30 px-2 py-0.5 bg-emerald-50/50">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Low Latency Grounded (gemini-3.1-flash-lite)</span>
                  </div>
                ) : result.source === "standard-generation" ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-700 font-bold uppercase border border-amber-500/30 px-2 py-0.5 bg-amber-50/50">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Low Latency AI (gemini-3.1-flash-lite)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-terracotta font-bold uppercase border border-brand-terracotta/30 px-2 py-0.5 bg-[#FAF8F5]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Curated Local Index</span>
                  </div>
                )}
              </div>

              {/* Text content formatted nicely */}
              <div className="text-sm text-brand-charcoal leading-relaxed font-light whitespace-pre-line space-y-4">
                {result.text}
              </div>

              {/* Status or warning details if fallback is active */}
              {result.isFallback ? (
                <div className="p-4 bg-brand-cream/30 border border-brand-warm-gray/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-brand-charcoal/70">
                    <ShieldAlert className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Resilient Connection Notice
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-brand-charcoal/60 uppercase leading-normal">
                    {result.fallbackReason || "Web Grounding rate limit reached. Using internal expertise."}
                  </p>
                </div>
              ) : (
                /* Security Charter */
                <div className="p-3 bg-brand-cream/30 border border-brand-warm-gray/40 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-sage mt-0.5" />
                  <p className="text-[10px] font-mono text-brand-charcoal/60 uppercase leading-normal">
                    All insights are verified dynamically with active web references. Perfect for confirming nutrition certifications & trends.
                  </p>
                </div>
              )}
            </div>

            {/* Google Search Grounding Sources */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-charcoal/60" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                  Verified Sources ({result.chunks.length})
                </h3>
              </div>

              {result.chunks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.chunks.map((chunk, index) => (
                    <a
                      key={index}
                      href={chunk.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white hover:bg-brand-cream/20 border border-brand-warm-gray/60 p-4 transition-all duration-300 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-grow min-w-0">
                        <span className="text-[9px] font-mono text-brand-terracotta uppercase tracking-wider block">
                          Reference [{index + 1}]
                        </span>
                        <h4 className="text-xs font-display font-semibold text-brand-charcoal group-hover:text-brand-terracotta transition-colors truncate">
                          {chunk.title}
                        </h4>
                        <p className="text-[10px] font-mono text-brand-charcoal/40 truncate">
                          {chunk.uri}
                        </p>
                      </div>
                      <div className="p-1 bg-brand-cream border border-brand-warm-gray/40 text-brand-charcoal group-hover:bg-brand-terracotta group-hover:text-white transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white border border-brand-warm-gray/40 text-center">
                  <p className="text-xs text-brand-charcoal/50 italic">
                    No web sources were explicitly listed in the response context.
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setQuery("");
                }}
                className="py-2.5 px-5 border border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal font-mono text-xs uppercase tracking-wider transition-all"
              >
                Inquire Again
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col: Presets Grid */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                Suggested Curation Inquiries
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {presetQueries.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(preset.text)}
                    className="text-left bg-white hover:bg-brand-cream/30 border border-brand-warm-gray/60 hover:border-brand-terracotta p-5 transition-all duration-300 space-y-2 group flex flex-col justify-between min-h-[140px] rounded-none cursor-pointer"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-brand-terracotta uppercase tracking-widest block mb-1">
                        Curator Prompt 0{index + 1}
                      </span>
                      <h4 className="text-sm font-display font-medium text-brand-charcoal group-hover:text-brand-terracotta transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-brand-charcoal/60 font-light mt-1.5 line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/40 group-hover:text-brand-terracotta transition-colors pt-2 font-bold">
                      <span>Begin Inquiry</span>
                      <CornerDownRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Col: Interactive Search Log */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                  Recent Inquiries
                </h2>
                <div className="bg-white border border-brand-warm-gray/80 p-5 space-y-4 shadow-sm">
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((h, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(h)}
                          className="w-full text-left p-2.5 bg-brand-cream/20 hover:bg-brand-cream/80 border border-brand-cream/60 text-xs font-mono text-brand-charcoal/70 truncate block hover:text-brand-terracotta transition-all cursor-pointer"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-charcoal/40 italic">
                      No inquiries recorded in this curation session.
                    </p>
                  )}

                  <div className="pt-4 border-t border-brand-cream space-y-2.5 text-xs text-brand-charcoal/50 leading-relaxed font-light">
                    <div className="flex items-center gap-1.5 font-mono uppercase text-[9px] text-brand-charcoal/70 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>How Grounding Works</span>
                    </div>
                    <p>
                      Unlike standard generative models, Grounding integrates current search index contexts directly to eliminate halucinatory references.
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Diagnostics Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                    Connection Diagnostics
                  </h2>
                  <button
                    type="button"
                    disabled={diagLoading}
                    onClick={runDiagnostics}
                    className="p-1 text-brand-charcoal hover:text-brand-terracotta disabled:opacity-40 cursor-pointer"
                    title="Run diagnostics test"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${diagLoading ? "animate-spin text-brand-terracotta" : ""}`} />
                  </button>
                </div>

                <div className="bg-white border border-brand-warm-gray/80 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-cream pb-3">
                    <span className="text-[10px] font-mono text-brand-charcoal/60 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-brand-terracotta" /> Live Integration status
                    </span>
                    {diagLoading ? (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-terracotta animate-pulse font-bold">
                        Testing...
                      </span>
                    ) : diagStatus?.status === "healthy" ? (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-sage font-bold bg-brand-sage/10 border border-brand-sage/30 px-1.5 py-0.5">
                        Fully Connected
                      </span>
                    ) : diagStatus?.status === "missing" ? (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-terracotta font-bold bg-brand-terracotta/10 border border-brand-terracotta/30 px-1.5 py-0.5 animate-pulse">
                        Key Missing
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-brand-terracotta font-bold bg-brand-terracotta/10 border border-brand-terracotta/30 px-1.5 py-0.5">
                        Offline Fallback
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* API Key Variable */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-brand-charcoal/80 font-bold block">
                          GEMINI_API_KEY
                        </span>
                        <span className="text-[9px] font-mono text-brand-charcoal/50 block">
                          Server-side secrets register
                        </span>
                      </div>
                      <div className="text-right">
                        {diagStatus?.hasKey ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-brand-sage font-bold block">
                              FOUND
                            </span>
                            <span className="text-[9px] font-mono text-brand-charcoal/40 block">
                              {diagStatus?.keyMask}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-brand-terracotta font-bold block">
                              NOT CONFIGURED
                            </span>
                            <span className="text-[9px] font-mono text-brand-charcoal/40 block">
                              Using local offline index
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Test Call Status */}
                    <div className="flex items-start justify-between gap-2 border-t border-brand-cream pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-brand-charcoal/80 font-bold block">
                          Gemini LLM Test
                        </span>
                        <span className="text-[9px] font-mono text-brand-charcoal/50 block">
                          Basic model response handshakes
                        </span>
                      </div>
                      <div className="text-right">
                        {diagStatus?.testCall?.status === "success" ? (
                          <span className="text-[10px] font-mono text-brand-sage font-bold block">
                            SUCCESSFUL
                          </span>
                        ) : diagStatus?.testCall?.status === "failed" ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-brand-terracotta font-bold block">
                              FAILED
                            </span>
                            <p className="text-[9px] text-brand-terracotta/80 leading-normal max-w-[150px] truncate" title={diagStatus?.testCall?.error}>
                              {diagStatus?.testCall?.error}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Search Grounding Status */}
                    <div className="flex items-start justify-between gap-2 border-t border-brand-cream pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-brand-charcoal/80 font-bold block">
                          Google Search Tool
                        </span>
                        <span className="text-[9px] font-mono text-brand-charcoal/50 block">
                          Dynamic web index grounding
                        </span>
                      </div>
                      <div className="text-right">
                        {diagStatus?.searchGrounding?.status === "success" ? (
                          <span className="text-[10px] font-mono text-brand-sage font-bold block">
                            AVAILABLE
                          </span>
                        ) : diagStatus?.searchGrounding?.status === "failed" ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-brand-terracotta font-bold block">
                              RESTRICTED
                            </span>
                            <p className="text-[9px] text-brand-terracotta/80 leading-normal max-w-[150px] truncate" title={diagStatus?.searchGrounding?.error}>
                              {diagStatus?.searchGrounding?.error}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!diagStatus?.hasKey && (
                    <div className="pt-3 border-t border-brand-cream text-[10px] font-mono text-brand-charcoal/50 leading-relaxed uppercase">
                      💡 Configure your key in the <strong className="text-brand-charcoal">Settings &gt; Secrets</strong> panel on your builder sidebar to enable live search grounding.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
