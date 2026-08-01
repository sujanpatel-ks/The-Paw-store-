import React, { useState, useEffect } from "react";
import { Sparkles, Building, MapPin, Tag, Clock, AlertTriangle } from "lucide-react";

interface PartnerOnboardingProps {
  onNavigate: (tab: string) => void;
  currentUser: any;
  onRefreshUser: () => Promise<void>;
}

export default function PartnerOnboarding({ onNavigate, currentUser, onRefreshUser }: PartnerOnboardingProps) {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check store status on mount
  const hasStore = !!currentUser?.partnerStore;
  const storeStatus = currentUser?.partnerStore?.approvalStatus;

  useEffect(() => {
    if (hasStore) {
      if (storeStatus === "ACTIVE") {
        // If already active, direct them to their partner dashboard/workspace
        onNavigate("partner-inventory");
      }
    }
  }, [hasStore, storeStatus, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/partner/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.email || ""}`
        },
        body: JSON.stringify({
          businessName,
          address,
          taxId: taxId || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
      await onRefreshUser(); // refresh user structure to load partnerStore
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // If already submitted and pending
  if (submitted || (hasStore && storeStatus === "PENDING")) {
    const activeStoreName = currentUser?.partnerStore?.businessName || businessName;
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 bg-brand-cream font-mono">
        <div className="w-full max-w-lg bg-white border border-brand-warm-gray p-8 text-center space-y-6 shadow-sm">
          <Clock className="w-16 h-16 text-brand-terracotta mx-auto animate-pulse" />
          <h2 className="text-xl font-display font-bold text-brand-charcoal uppercase tracking-wider">
            Application Pending Review
          </h2>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light font-sans">
            Your partner application for <strong>{activeStoreName}</strong> has been successfully received by our curation desk.
          </p>
          <div className="p-4 bg-brand-oatmeal/30 border border-brand-warm-gray/50 text-[11px] text-brand-charcoal/80 space-y-2">
            <p><strong>Status:</strong> PENDING ADMIN APPROVAL</p>
            <p>Your application is pending admin approval. You will receive an email when approved.</p>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => onNavigate("storefront")}
              className="px-6 py-2.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-xs font-mono uppercase tracking-widest font-bold cursor-pointer"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If rejected store
  if (hasStore && storeStatus === "REJECTED") {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 bg-brand-cream font-mono">
        <div className="w-full max-w-lg bg-white border border-brand-warm-gray p-8 text-center space-y-6 shadow-sm">
          <AlertTriangle className="w-16 h-16 text-brand-terracotta mx-auto" />
          <h2 className="text-xl font-display font-bold text-brand-charcoal uppercase tracking-wider">
            Application Rejected
          </h2>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light font-sans">
            We regret to inform you that your application for <strong>{currentUser.partnerStore.businessName}</strong> was not approved at this time.
          </p>
          <div className="p-4 bg-brand-terracotta/5 border border-brand-terracotta/20 text-xs text-brand-terracotta text-left space-y-2">
            <p className="font-bold uppercase tracking-wider text-[10px]">Rejection Reason:</p>
            <p className="italic font-sans">{currentUser.partnerStore.rejectionReason || "No reason provided."}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => {
                // Allow them to re-apply by purging the client view locally
                setSubmitted(false);
                setBusinessName("");
                setAddress("");
                setTaxId("");
                setError(null);
                // In production, we'd delete the old store application or allow PATCH.
                // For this mock/sandbox, we let them view the form again:
                currentUser.partnerStore = null;
              }}
              className="px-6 py-2.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-xs font-mono uppercase tracking-widest font-bold cursor-pointer"
            >
              Submit New Application
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
