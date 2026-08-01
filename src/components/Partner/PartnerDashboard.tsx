import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, ShoppingBag, Layers, ShieldCheck, Mail, MapPin } from "lucide-react";
import AddProductModal from "./AddProductModal";

interface PartnerDashboardProps {
  currentUser: any;
  onNavigate: (tab: string) => void;
}

export default function PartnerDashboard({ currentUser, onNavigate }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "fulfillments">("catalog");
  const [inventory, setInventory] = useState<any[]>([]);
  const [fulfillments, setFulfillments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("");
  const [razorpayStatus, setRazorpayStatus] = useState<string>("NOT_STARTED");
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  const fetchPaymentStatus = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch("/api/payments/partner/status", {
        headers: { "Authorization": `Bearer ${currentUser.email}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRazorpayStatus(data.razorpayAccountStatus || data.stripeAccountStatus || "NOT_STARTED");
      }
    } catch (e) {}
  };

  const handleOnboardPayment = async () => {
    if (!currentUser?.email) return;
    setIsOnboardingLoading(true);
    try {
      const res = await fetch("/api/payments/partner/onboard", {
        method: "POST",
        headers: { "Authorization": `Bearer ${currentUser.email}` }
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      alert("Failed to initiate Razorpay onboarding.");
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  const store = currentUser?.partnerStore;
  const storeId = store?.id || "default_store";
  const logoUrl = store?.logoUrl || "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=200";

  const fetchInventory = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/partner/inventory", {
        headers: {
          "Authorization": `Bearer ${currentUser.email}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to load store inventory list.");
      }
      const data = await res.json();
      setInventory(data || []);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchFulfillments = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    setError(null);
    try {
      const url = fulfillmentFilter
        ? `/api/partner/fulfillments?status=${fulfillmentFilter}`
        : "/api/partner/fulfillments";
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${currentUser.email}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to load store fulfillments.");
      }
      const data = await res.json();
      setFulfillments(data.fulfillments || []);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (fulfillmentId: string, status: string) => {
    try {
      const res = await fetch(`/api/partner/fulfillments/${fulfillmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.email}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update fulfillment status.");
      }
      fetchFulfillments();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
    if (activeTab === "catalog") {
      fetchInventory();
    } else {
      fetchFulfillments();
    }
  }, [currentUser, activeTab, fulfillmentFilter]);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-brand-cream py-12 px-6 md:px-12 font-sans selection:bg-brand-terracotta/10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Razorpay Route Onboarding Banner */}
        {razorpayStatus !== "ACTIVE" && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-bold text-amber-900 uppercase">Connect Your Razorpay Account</p>
                <p className="text-amber-800 text-[11px] font-sans mt-0.5">
                  To receive automated marketplace payouts, you must connect your store with Razorpay Route.
                </p>
              </div>
            </div>
            <button
              onClick={handleOnboardPayment}
              disabled={isOnboardingLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isOnboardingLoading ? "Connecting..." : "Connect with Razorpay"}
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white border border-brand-warm-gray/25 p-6 md:p-8 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-brand-sand/15 rounded-lg border border-brand-warm-gray/15">
                <ShoppingBag className="w-6 h-6 text-brand-terracotta" />
              </span>
              <div>
                <h1 className="text-xl font-display font-bold text-brand-charcoal uppercase tracking-wider">
                  {store?.businessName || "Partner Workspace"}
                </h1>
                <p className="text-xs text-brand-charcoal/40 font-mono">Bespoke Boutique Partner Portal</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs font-mono text-brand-charcoal/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] uppercase font-bold rounded">
                  Status: {store?.approvalStatus || "ACTIVE"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-brand-charcoal/40" />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-charcoal/40" />
                <span>{store?.address || "Seattle, WA"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={fetchInventory}
              disabled={loading}
              className="p-3 border border-brand-warm-gray/30 text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Inventory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-5 py-3 bg-brand-charcoal text-white hover:bg-brand-terracotta transition-colors text-xs uppercase font-mono tracking-widest font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-brand-warm-gray/30 gap-6 font-mono text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "catalog"
                ? "border-brand-charcoal text-brand-charcoal font-extrabold"
                : "border-transparent text-brand-charcoal/40 hover:text-brand-charcoal"
            }`}
          >
            <Layers className="w-4 h-4" />
            Stock Catalog ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("fulfillments")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "fulfillments"
                ? "border-brand-terracotta text-brand-terracotta font-extrabold"
                : "border-transparent text-brand-charcoal/40 hover:text-brand-charcoal"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Store Orders & Fulfillments ({fulfillments.length})
          </button>
        </div>

        {/* Catalog Content */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            {loading && inventory.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-brand-warm-gray/10 rounded-xl h-64"></div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">
                {error}
              </div>
            )}

            {!loading && inventory.length === 0 && (
              <div className="bg-white border border-brand-warm-gray/25 p-12 text-center rounded-xl space-y-4 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-brand-charcoal/20 mx-auto" />
                <h3 className="text-sm font-semibold text-brand-charcoal">No Products Uploaded Yet</h3>
                <p className="text-xs text-brand-charcoal/40 font-sans max-w-sm mx-auto leading-relaxed">
                  Start stocking your digital shelf by uploading product shelfies, extracting properties with AI, and managing stock levels.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-brand-charcoal text-white hover:bg-brand-terracotta text-xs font-mono uppercase tracking-wider font-semibold"
                >
                  Upload First Item
                </button>
              </div>
            )}

            {!loading && inventory.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((item) => {
                  const prod = item.product || item;
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-brand-warm-gray/25 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                    >
                      {/* Image Box */}
                      <div className="h-44 bg-brand-sand/15 p-4 flex items-center justify-center relative border-b border-brand-warm-gray/10">
                        <img
                          src={item.shelfImageUrl || prod.image || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain rounded transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 right-3 bg-brand-charcoal text-white text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider">
                          {prod.category}
                        </span>
                      </div>

                      {/* Meta Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[10px] font-mono text-brand-terracotta uppercase font-bold tracking-wider">
                            {prod.brand}
                          </span>
                          <h3 className="text-sm font-display font-bold text-brand-charcoal uppercase leading-tight line-clamp-1">
                            {prod.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-brand-warm-gray/10 pt-3 text-[11px] font-mono">
                          <div className="space-y-0.5">
                            <span className="text-brand-charcoal/40 uppercase text-[9px]">Local Price</span>
                            <p className="font-bold text-brand-charcoal">₹{Number(item.price).toFixed(2)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-brand-charcoal/40 uppercase text-[9px]">Stock Level</span>
                            <p className="font-bold text-brand-charcoal">{item.stockQuantity ?? 1} units</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fulfillments Content */}
        {activeTab === "fulfillments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-brand-warm-gray/25 p-4 rounded-xl">
              <span className="text-xs font-mono font-bold uppercase text-brand-charcoal/70">
                Filter Orders by Status:
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {["", "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFulfillmentFilter(st)}
                    className={`px-3 py-1 border transition-all text-[10px] uppercase font-bold cursor-pointer ${
                      fulfillmentFilter === st
                        ? "bg-brand-charcoal text-white border-brand-charcoal"
                        : "bg-white text-brand-charcoal/70 border-brand-warm-gray/40 hover:bg-brand-sand/20"
                    }`}
                  >
                    {st || "ALL"}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="p-8 text-center font-mono text-xs text-brand-charcoal/50">
                Loading store fulfillment orders...
              </div>
            )}

            {!loading && fulfillments.length === 0 && (
              <div className="bg-white border border-brand-warm-gray/25 p-12 text-center rounded-xl space-y-3 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-brand-charcoal/20 mx-auto" />
                <h3 className="text-sm font-semibold text-brand-charcoal">No Fulfillments Found</h3>
                <p className="text-xs text-brand-charcoal/40 font-sans max-w-sm mx-auto">
                  {fulfillmentFilter ? `No store orders with status "${fulfillmentFilter}".` : "Incoming multi-vendor orders for your store will appear here."}
                </p>
              </div>
            )}

            {!loading && fulfillments.length > 0 && (
              <div className="space-y-4">
                {fulfillments.map((ful) => (
                  <div key={ful.id} className="bg-white border border-brand-warm-gray/25 p-6 rounded-xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-warm-gray/15 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold uppercase text-brand-charcoal">
                            Order ID: {ful.orderId || ful.id}
                          </span>
                          <span className="px-2.5 py-0.5 bg-brand-charcoal text-white text-[9px] font-mono font-bold uppercase rounded">
                            Status: {ful.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-charcoal/40 block mt-0.5">
                          Received: {new Date(ful.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Action status buttons */}
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {ful.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateStatus(ful.id, "CONFIRMED")}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-[10px] uppercase hover:bg-emerald-700 transition-colors"
                          >
                            Confirm Order
                          </button>
                        )}
                        {(ful.status === "PENDING" || ful.status === "CONFIRMED") && (
                          <button
                            onClick={() => handleUpdateStatus(ful.id, "PREPARING")}
                            className="px-3 py-1.5 bg-amber-600 text-white font-bold text-[10px] uppercase hover:bg-amber-700 transition-colors"
                          >
                            Mark Preparing
                          </button>
                        )}
                        {(ful.status === "CONFIRMED" || ful.status === "PREPARING") && (
                          <button
                            onClick={() => handleUpdateStatus(ful.id, "READY")}
                            className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[10px] uppercase hover:bg-blue-700 transition-colors"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}
                        {ful.status !== "COMPLETED" && ful.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleUpdateStatus(ful.id, "CANCELLED")}
                            className="px-3 py-1.5 border border-red-300 text-red-600 font-bold text-[10px] uppercase hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 font-mono text-xs">
                      <span className="text-[10px] text-brand-charcoal/40 uppercase font-bold block">
                        Ordered Items ({Array.isArray(ful.items) ? ful.items.length : 0})
                      </span>
                      {Array.isArray(ful.items) && ful.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-brand-sand/10 p-2.5 rounded">
                          <div>
                            <span className="font-bold text-brand-charcoal">{it.quantity}x {it.name}</span>
                            <span className="text-[10px] text-brand-charcoal/50 block">SKU / Inv: {it.inventoryId}</span>
                          </div>
                          <span className="font-bold">₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {ful.notes && (
                      <div className="bg-brand-sand/15 p-3 rounded text-xs font-mono text-brand-charcoal/80">
                        <span className="font-bold uppercase text-[9px] text-brand-terracotta block">Customer Pickup Note:</span>
                        <p className="mt-0.5">{ful.notes}</p>
                      </div>
                    )}

                    {/* Financial Breakdown */}
                    <div className="flex justify-between items-center border-t border-brand-warm-gray/15 pt-3 font-mono text-xs text-brand-charcoal">
                      <div className="space-x-3 text-brand-charcoal/60 text-[11px]">
                        <span>Subtotal: ₹{Number(ful.subtotal).toFixed(2)}</span>
                        <span>Tax: ₹{Number(ful.tax).toFixed(2)}</span>
                      </div>
                      <div className="text-sm font-bold text-brand-charcoal">
                        Total Payout: ₹{Number(ful.total).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storeId={storeId}
        logoUrl={logoUrl}
        authToken={currentUser?.email || ""}
        onSuccess={fetchInventory}
      />
    </div>
  );
}
