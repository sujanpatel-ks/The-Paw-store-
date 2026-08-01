/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, 
  Calendar, 
  MapPin, 
  ClipboardCheck, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Package,
  Building
} from "lucide-react";

interface OrderTrackerProps {
  order: any; // extended Order with optional fulfillments
}

interface TrackingStep {
  label: string;
  desc: string;
  completed: boolean;
  active: boolean;
}

interface TrackingTimelineItem {
  date: string;
  time: string;
  title: string;
  description: string;
  location: string;
  status: "completed" | "active" | "pending";
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [fulfillments, setFulfillments] = useState<any[]>(order?.fulfillments || []);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleConfirmPickup = async (fulfillmentId: string) => {
    setCompletingId(fulfillmentId);
    try {
      const res = await fetch(`/api/orders/${order.id}/fulfillments/${fulfillmentId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sarah.curator@example.com"
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm pickup.");
      }
      setFulfillments(prev => prev.map(f => f.id === fulfillmentId ? { ...f, status: "COMPLETED", pickedUpAt: new Date().toISOString() } : f));
      alert("Pickup confirmed successfully! Thank you for visiting our partner store.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const getTrackingData = (orderId: string, status: string, date: string) => {
    const carrier = "FedEx Premium Secure";
    const trackingNumber = `FEX-${orderId.split("-")[1] || "9832"}-2026`;
    const service = "Bespoke Climate-Control Courier Delivery";
    let estimatedArrival = "";
    let steps: TrackingStep[] = [];
    let timeline: TrackingTimelineItem[] = [];

    if (status === "Processing") {
      estimatedArrival = "Arriving Sunday, July 19, 2026";
      steps = [
        { label: "Ordered", desc: "Order Secured", completed: true, active: false },
        { label: "Processing", desc: "Curation & Quality Check", completed: true, active: true },
        { label: "In Transit", desc: "Carrier Dispatch", completed: false, active: false },
        { label: "Out for Delivery", desc: "Local Route Dispatch", completed: false, active: false },
        { label: "Delivered", desc: "Arrived Safely", completed: false, active: false },
      ];
      timeline = [
        {
          date: "July 15, 2026",
          time: "10:45 AM",
          title: "Bespoke Packaging Completed",
          description: "Your select items passed our rigorous quality standards and were carefully hand-wrapped in double-layered natural canvas.",
          location: "Seattle Fulfillment Center A, WA",
          status: "active"
        },
        {
          date: "July 15, 2026",
          time: "10:14 AM",
          title: "Companion Order Authorized",
          description: "Security check and VIP companion rewards points calculated and approved.",
          location: "Seattle, WA",
          status: "completed"
        },
        {
          date: "July 15, 2026",
          time: "10:10 AM",
          title: "Secure Order Placed",
          description: "Sarah Jenkins initiated transaction checkout.",
          location: "Seattle, WA",
          status: "completed"
        }
      ];
    } else if (status === "In Transit") {
      estimatedArrival = "Arriving Friday, July 17, 2026";
      steps = [
        { label: "Ordered", desc: "Order Secured", completed: true, active: false },
        { label: "Processing", desc: "Curation & Quality Check", completed: true, active: false },
        { label: "In Transit", desc: "Carrier Dispatch", completed: true, active: true },
        { label: "Out for Delivery", desc: "Local Route Dispatch", completed: false, active: false },
        { label: "Delivered", desc: "Arrived Safely", completed: false, active: false },
      ];
      timeline = [
        {
          date: "July 15, 2026",
          time: "09:30 AM",
          title: "In Transit - Departed Hub",
          description: "Package departed FedEx Seattle Sort Facility. Carrier reports standard shipping flow on track.",
          location: "FedEx Kent Transit Hub, WA",
          status: "active"
        },
        {
          date: "July 14, 2026",
          time: "05:45 PM",
          title: "Arrived at Carrier Sort Center",
          description: "Scanned and verified into the regional courier delivery pool.",
          location: "FedEx Kent Transit Hub, WA",
          status: "completed"
        },
        {
          date: "July 14, 2026",
          time: "02:15 PM",
          title: "Dispatched from Warehouse",
          description: "Handed over securely to our climate-controlled shipping logistics partner.",
          location: "Seattle Fulfillment Center A, WA",
          status: "completed"
        },
        {
          date: "July 14, 2026",
          time: "11:00 AM",
          title: "Curation Quality Approved",
          description: "Sizing and finish verified. Linen protective custom canvas cover fitted.",
          location: "Seattle, WA",
          status: "completed"
        },
        {
          date: "July 14, 2026",
          time: "10:45 AM",
          title: "Order Checked Out",
          description: "VIP Companion checkout successfully validated.",
          location: "Seattle, WA",
          status: "completed"
        }
      ];
    } else if (status === "Delivered") {
      estimatedArrival = `Delivered on ${date}`;
      steps = [
        { label: "Ordered", desc: "Order Secured", completed: true, active: false },
        { label: "Processing", desc: "Curation & Quality Check", completed: true, active: false },
        { label: "In Transit", desc: "Carrier Dispatch", completed: true, active: false },
        { label: "Out for Delivery", desc: "Local Route Dispatch", completed: true, active: false },
        { label: "Delivered", desc: "Arrived Safely", completed: true, active: true },
      ];
      
      const d = date.split(", ")[0] || "May 14";
      timeline = [
        {
          date: `${d}, 2026`,
          time: "02:30 PM",
          title: "Safe Dropoff - Delivered",
          description: "Package hand-delivered and verified. Signature matched, placed in secure companion entry locker.",
          location: "Sarah Jenkins Residence, Seattle, WA",
          status: "active"
        },
        {
          date: `${d}, 2026`,
          time: "08:15 AM",
          title: "Out for Delivery",
          description: "Parcel loaded onto local electric dispatch van.",
          location: "Seattle Delivery Center, WA",
          status: "completed"
        },
        {
          date: `${d}, 2026`,
          time: "02:00 AM",
          title: "Arrived at Local Carrier Facility",
          description: "Offloaded and scanned into local route staging area.",
          location: "Seattle Delivery Center, WA",
          status: "completed"
        },
        {
          date: `${d}, 2026`,
          time: "09:45 AM",
          title: "Shipped & Dispatched",
          description: "Order left distribution point. Carrier transit validated.",
          location: "West Coast Logistics Point, OR",
          status: "completed"
        }
      ];
    } else {
      estimatedArrival = "Curation Cancelled";
      steps = [
        { label: "Ordered", desc: "Order Secured", completed: true, active: false },
        { label: "Cancelled", desc: "Canceled by Customer", completed: true, active: true },
      ];
      timeline = [
        {
          date: date,
          time: "11:20 AM",
          title: "Curation Cancelled",
          description: "Order cancelled as requested and full credit refund processed back to merchant sweep.",
          location: "Seattle, WA",
          status: "active"
        },
        {
          date: date,
          time: "10:14 AM",
          title: "Order Placed",
          description: "Purchase transaction verified.",
          location: "Seattle, WA",
          status: "completed"
        }
      ];
    }

    return { carrier, trackingNumber, service, estimatedArrival, steps, timeline };
  };

  const { carrier, trackingNumber, service, estimatedArrival, steps, timeline } = getTrackingData(
    order.id, 
    order.status, 
    order.date
  );

  const handleSync = () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("Courier telemetry successfully matched. All events are fully synchronized.");
      setTimeout(() => {
        setSyncStatus(null);
      }, 4000);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden bg-brand-cream/15 border-t border-brand-warm-gray/60"
    >
      <div className="p-6 md:p-8 space-y-8 text-left">
        {/* Core Header Metrics */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-brand-warm-gray/50">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase font-bold block mb-1">
              Active Telemetry Feed
            </span>
            <h3 className="text-xl font-display font-light text-brand-charcoal">
              {estimatedArrival}
            </h3>
            <p className="text-[11px] font-mono text-brand-charcoal/50 mt-1">
              Service: <span className="text-brand-charcoal font-medium">{service}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-brand-warm-gray/60 px-3 py-1.5 font-mono text-[10px] text-brand-charcoal">
              <span className="text-brand-charcoal/40 uppercase font-bold mr-1">CARRIER:</span> {carrier}
            </div>
            <div className="bg-white border border-brand-warm-gray/60 px-3 py-1.5 font-mono text-[10px] text-brand-charcoal">
              <span className="text-brand-charcoal/40 uppercase font-bold mr-1">TRACKING #:</span> {trackingNumber}
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-brand-charcoal hover:bg-brand-sage text-white font-mono text-[10px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Live Courier"}
            </button>
          </div>
        </div>

        {/* Multi-Vendor Store Fulfillments Section */}
        {fulfillments && fulfillments.length > 0 && (
          <div className="bg-white border border-brand-warm-gray p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-warm-gray/60 pb-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-terracotta" />
                Multi-Vendor Store Split Fulfillments ({fulfillments.length})
              </h4>
              <span className="text-[10px] font-mono bg-brand-sand/30 text-brand-charcoal/70 px-2 py-0.5 uppercase">
                Boutique Pickup Tracking
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fulfillments.map((ful: any, idx: number) => (
                <div key={ful.id || idx} className="border border-brand-warm-gray/40 p-4 space-y-3 bg-brand-sand/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-display font-bold text-brand-charcoal uppercase">
                        {ful.store?.businessName || `Boutique Partner Store #${idx + 1}`}
                      </h5>
                      <p className="text-[10px] font-mono text-brand-charcoal/50">{ful.store?.address || "Seattle, WA"}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                      ful.status === "READY" 
                        ? "bg-emerald-600 text-white animate-pulse"
                        : ful.status === "COMPLETED"
                        ? "bg-brand-sage text-white"
                        : "bg-brand-charcoal text-white"
                    }`}>
                      {ful.status}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] border-t border-brand-warm-gray/20 pt-2">
                    {Array.isArray(ful.items) && ful.items.map((it: any, iIdx: number) => (
                      <div key={iIdx} className="flex justify-between text-brand-charcoal/80">
                        <span>{it.quantity}x {it.name}</span>
                        <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {ful.status === "READY" && (
                    <button
                      onClick={() => handleConfirmPickup(ful.id)}
                      disabled={completingId === ful.id}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {completingId === ful.id ? "Confirming..." : "Confirm Item Pickup"}
                    </button>
                  )}

                  {ful.status === "COMPLETED" && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 p-2 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Picked Up by Customer {ful.pickedUpAt ? `(${new Date(ful.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {syncStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-emerald-800 font-mono text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-sage shrink-0" />
              <span>{syncStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Step Tracker (Horizontal) */}
        <div className="hidden md:block">
          <div className="flex justify-between items-start relative px-4">
            {/* Horizontal Line connector */}
            <div className="absolute top-4 left-10 right-10 h-[2px] bg-brand-warm-gray/40 -z-10" />
            
            {/* Active completed line */}
            <div 
              className="absolute top-4 left-10 h-[2px] bg-brand-sage transition-all duration-700 -z-10"
              style={{
                width: `${
                  steps.length <= 2 
                    ? (steps.findIndex(s => s.active) / (steps.length - 1)) * 100 
                    : (steps.filter(s => s.completed).length - 1) * 23.5
                }%`
              }}
            />

            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.active;
              return (
                <div key={idx} className="flex flex-col items-center text-center max-w-[120px] space-y-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold border transition-all duration-300 ${
                      isActive 
                        ? "bg-brand-terracotta text-white border-brand-terracotta ring-4 ring-brand-terracotta/10 scale-110"
                        : isCompleted
                        ? "bg-brand-sage text-white border-brand-sage"
                        : "bg-white text-brand-charcoal/30 border-brand-warm-gray"
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div>
                    <h4 className={`text-[11px] font-mono uppercase tracking-wider font-bold ${isActive ? "text-brand-terracotta" : "text-brand-charcoal"}`}>
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-brand-charcoal/50 leading-tight mt-0.5 font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Tracker (Vertical Compact summary) */}
        <div className="block md:hidden border border-brand-warm-gray/40 bg-white p-4">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/40 mb-3 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-charcoal" /> Progress Status Journey
          </h4>
          <div className="flex items-center justify-between font-mono text-xs">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    step.active 
                      ? "bg-brand-terracotta text-white border-brand-terracotta"
                      : step.completed
                      ? "bg-brand-sage text-white border-brand-sage"
                      : "bg-brand-oatmeal/40 text-brand-charcoal/30 border-brand-warm-gray/40"
                  }`}
                >
                  {step.completed && !step.active ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <span className={`text-[9px] font-bold uppercase ${step.active ? "text-brand-terracotta" : "text-brand-charcoal/50"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Timeline and Milestones */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/40 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-charcoal" /> Detailed Historical Timeline
          </h4>

          <div className="space-y-6 relative pl-6">
            {/* Connecting Vertical line */}
            <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[2px] bg-brand-warm-gray/40" />

            {timeline.map((item, idx) => {
              const isActive = item.status === "active";
              const isCompleted = item.status === "completed";
              return (
                <div key={idx} className="relative flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
                  {/* Timeline Node Dot */}
                  <div 
                    className={`absolute -left-[21px] top-1.5 w-[11px] h-[11px] rounded-full border-2 bg-white transition-all ${
                      isActive 
                        ? "border-brand-terracotta bg-brand-terracotta ring-4 ring-brand-terracotta/20 animate-pulse"
                        : isCompleted
                        ? "border-brand-sage bg-brand-sage"
                        : "border-brand-warm-gray bg-brand-oatmeal"
                    }`}
                  />

                  {/* Date and Time (Left column on desktop) */}
                  <div className="md:w-36 shrink-0 text-left">
                    <span className="font-mono text-[10px] font-bold text-brand-charcoal block">
                      {item.date}
                    </span>
                    <span className="font-mono text-[10px] text-brand-charcoal/50 block">
                      {item.time}
                    </span>
                  </div>

                  {/* Event Details (Right column on desktop) */}
                  <div className="flex-grow space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className={`text-xs font-bold font-mono uppercase tracking-wider ${isActive ? "text-brand-terracotta" : "text-brand-charcoal"}`}>
                        {item.title}
                      </h5>
                      <span className="text-[9px] font-mono bg-brand-oatmeal/60 border border-brand-warm-gray/30 px-2 py-0.5 text-brand-charcoal/60 rounded-none uppercase flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 shrink-0" /> {item.location}
                      </span>
                    </div>
                    <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Warning & Help Center */}
        <div className="bg-brand-oatmeal/30 border border-brand-warm-gray/40 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
          <div className="flex items-start gap-2">
            <ClipboardCheck className="w-4 h-4 text-brand-charcoal/40 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <p className="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">Curation Security Check</p>
              <p className="text-[10px] text-brand-charcoal/60 leading-tight">All companion beds and premium accessories undergo a strict double-sanitizing seal prior to carrier handover.</p>
            </div>
          </div>
          <button 
            onClick={() => alert("Connecting with FedEx Secure Courier Desk... Call support ID: 1-800-BOUTIQUE.")}
            className="text-[9px] text-brand-terracotta hover:text-brand-charcoal font-bold underline uppercase shrink-0 flex items-center gap-1"
          >
            Courier Support Desk <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
