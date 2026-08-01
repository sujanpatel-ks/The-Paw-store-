import React, { useState } from "react";
import { Sparkles, Building, MapPin, Tag, Globe, Compass, CheckCircle } from "lucide-react";

interface OnboardingFormProps {
  onNavigate: (tab: string) => void;
  currentUser: string | null;
}

export default function OnboardingForm({ onNavigate, currentUser }: OnboardingFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/partner/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser || "sarah-vip"}`
        },
        body: JSON.stringify({
          businessName,
          address,
          taxId,
          lat: lat ? Number(lat) : undefined,
          lng: lng ? Number(lng) : undefined,
          logoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 bg-brand-cream font-mono">
        <div className="w-full max-w-lg bg-white border border-brand-warm-gray p-8 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-brand-sage mx-auto animate-bounce" />
          <h2 className="text-xl font-display font-bold text-brand-charcoal uppercase tracking-wider">
            Application Submitted
          </h2>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light font-sans">
            Your partner application for <strong>{businessName}</strong> has been successfully received by our curation desk and is pending review by the marketplace administration.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate("storefront")}
              className="px-6 py-2.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-xs font-mono uppercase tracking-widest font-bold"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 bg-brand-cream font-mono">
      <div className="w-full max-w-xl bg-white border border-brand-warm-gray p-8 md:p-10 shadow-sm space-y-8">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-terracotta font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-brand-terracotta animate-pulse" /> Partner Workspace Onboarding
          </span>
          <h1 className="text-2xl font-display font-medium text-brand-charcoal mt-1">
            Apply for Partner Store
          </h1>
          <p className="text-xs text-brand-charcoal/50 leading-relaxed font-light mt-1 font-sans">
            Please provide your business credentials to register as an active marketplace vendor.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-brand-terracotta/10 border-l-2 border-brand-terracotta text-brand-terracotta text-xs font-medium">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Store Business Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Downtown Pet Supply"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
                <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                Store Physical Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Seattle, WA 98101"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                />
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Tax Registration ID (Tax ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="TAX-123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                  />
                  <Tag className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Store Logo URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-warm-gray text-sm focus:outline-none focus:border-brand-sage rounded-none"
                  />
                  <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-cream/30 p-3.5 border border-brand-warm-gray/40">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Latitude Coordinate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="47.6062"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage rounded-none"
                  />
                  <Compass className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-brand-charcoal/40" />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-charcoal/50 block mb-1">
                  Longitude Coordinate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-122.3321"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage rounded-none"
                  />
                  <Compass className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-brand-charcoal/40" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-charcoal hover:bg-brand-sage text-white transition-all text-xs font-mono uppercase tracking-widest font-bold disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Submitting Application..." : "Submit Partner Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
