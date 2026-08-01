import React, { useState, useEffect } from "react";
import { Sparkles, Shield, User, Building, MapPin, Tag, Check, X, ShieldAlert, AlertCircle } from "lucide-react";

interface PendingStore {
  id: string;
  businessName: string;
  address: string;
  taxId: string | null;
  ownerId: string;
  approvalStatus: string;
  owner: {
    email: string;
    name: string | null;
    username: string | null;
  };
}

interface AdminApprovalQueueProps {
  currentUser: any;
}

export default function AdminApprovalQueue({ currentUser }: AdminApprovalQueueProps) {
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners/pending", {
        headers: {
          "Authorization": `Bearer ${currentUser?.email || "admin-token"}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch pending applications");
      }
      setPendingStores(data.pendingStores || []);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [currentUser]);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    let rejectionReason: string | null = null;
    if (action === "REJECT") {
      rejectionReason = prompt("Please enter the reason for rejection:");
      if (rejectionReason === null) return; // user cancelled prompt
      if (!rejectionReason.trim()) {
        alert("Rejection reason is required.");
        return;
      }
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.email || "admin-token"}`
        },
        body: JSON.stringify({
          action,
          rejectionReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete action");
      }

      // Remove from list or reload
      setPendingStores(prev => prev.filter(s => s.id !== id));
      alert(action === "APPROVE" ? "Partner store successfully approved!" : "Partner store application rejected.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && pendingStores.length === 0) {
    return (
      <div className="p-8 text-center font-mono text-xs text-brand-charcoal/50">
        Loading pending partner applications...
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-warm-gray p-6 space-y-6 font-mono text-brand-charcoal">
      <div className="flex justify-between items-center border-b border-brand-warm-gray/60 pb-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-brand-terracotta font-bold flex items-center gap-1">
            <Shield className="w-3 h-3 fill-brand-terracotta/20 text-brand-terracotta" /> Marketplace Operations
          </span>
          <h2 className="text-lg font-display font-medium mt-0.5">
            Partner Store Approval Queue
          </h2>
        </div>
        <button
          onClick={fetchPending}
          disabled={loading}
          className="px-3 py-1 border border-brand-charcoal text-[10px] uppercase font-bold hover:bg-brand-cream tracking-wider disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Refreshing..." : "Refresh Queue"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-brand-terracotta/10 border-l-2 border-brand-terracotta text-brand-terracotta text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Error loading queue: {error}</span>
        </div>
      )}

      {pendingStores.length === 0 ? (
        <div className="py-12 border border-dashed border-brand-warm-gray text-center space-y-2">
          <Check className="w-8 h-8 text-brand-sage mx-auto" />
          <h3 className="text-xs uppercase font-bold tracking-wider">Queue Clear</h3>
          <p className="text-[10px] text-brand-charcoal/50 font-sans max-w-xs mx-auto">
            There are no pending partner store applications requiring administrative evaluation at this time.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-warm-gray text-[10px] uppercase tracking-wider text-brand-charcoal/50">
                <th className="py-2.5 font-bold">Business Name</th>
                <th className="py-2.5 font-bold">Owner Information</th>
                <th className="py-2.5 font-bold">Location / Address</th>
                <th className="py-2.5 font-bold">Credentials</th>
                <th className="py-2.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingStores.map((store) => (
                <tr key={store.id} className="border-b border-brand-warm-gray/40 hover:bg-brand-cream/20">
                  <td className="py-4 pr-4">
                    <div className="font-bold flex items-center gap-1.5 text-brand-charcoal">
                      <Building className="w-3.5 h-3.5 text-brand-charcoal/60" />
                      {store.businessName}
                    </div>
                    <span className="text-[9px] text-brand-charcoal/40 block mt-0.5 font-mono">ID: {store.id}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-charcoal/60" />
                      {store.owner.name || "Default Owner"}
                    </div>
                    <span className="text-[10px] text-brand-charcoal/50 block mt-0.5">{store.owner.email}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-start gap-1 text-[11px] leading-tight text-brand-charcoal/80">
                      <MapPin className="w-3.5 h-3.5 text-brand-charcoal/40 mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-mono text-[10px]">
                    <div className="flex items-center gap-1 text-brand-charcoal/70">
                      <Tag className="w-3 h-3 text-brand-charcoal/40" />
                      <span>Tax ID: {store.taxId || "N/A"}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleAction(store.id, "APPROVE")}
                        disabled={processingId !== null}
                        className="p-1.5 bg-brand-sage/10 text-brand-sage hover:bg-brand-sage hover:text-white border border-brand-sage/20 transition-all cursor-pointer disabled:opacity-50"
                        title="Approve Store Application"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction(store.id, "REJECT")}
                        disabled={processingId !== null}
                        className="p-1.5 bg-brand-terracotta/10 text-brand-terracotta hover:bg-brand-terracotta hover:text-white border border-brand-terracotta/20 transition-all cursor-pointer disabled:opacity-50"
                        title="Reject Store Application"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
