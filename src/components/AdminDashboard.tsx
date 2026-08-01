/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { BarChart3, Package, Users, DollarSign, Search, Bell, Settings, ExternalLink, HelpCircle, Check, RefreshCw, AlertTriangle, Trash2, Terminal, ArrowRight, Clock, Activity, CheckCircle2, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Inner navigation tabs for Admin view
  const [activeAdminTab, setActiveAdminTab] = useState<"overview" | "products" | "orders" | "customers" | "partners">("overview");

  // Diagnostics & Notification Panel State
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [panelTab, setPanelTab] = useState<"errors" | "notifications">("errors");
  const [debuggingErrorId, setDebuggingErrorId] = useState<string | null>(null);
  const [debugLogStep, setDebugLogStep] = useState<number>(0);
  const [isDebugRunning, setIsDebugRunning] = useState<boolean>(false);

  // Active Errors state (Initially 2 errors)
  const [errors, setErrors] = useState([
    {
      id: "err-1",
      title: "Warehouse Inventory Shortage",
      description: "Cloud Orthopedic Bed (Medium) is down to 0 units in Seattle Warehouse A.",
      code: "STOCK_DEPLETED_0",
      time: "10m ago",
      resolved: false,
      debugSteps: [
        "Scanning inventory database records...",
        "Identifying physical product depletion in Warehouse A (Aisles 12-B)...",
        "Initiating automated courier requisition for 50x Cloud Orthopedic Bed (Medium)...",
        "Injecting replenished count to core boutique state...",
        "Database updated successfully! Stock replenished to 50 units."
      ]
    },
    {
      id: "err-2",
      title: "Logistics API Connection Failure",
      description: "Couriers dispatch system (FedEx Secure API) failed to authenticate SSL handshake.",
      code: "API_HANDSHAKE_503",
      time: "42m ago",
      resolved: false,
      debugSteps: [
        "Verifying SSL/TLS certificates and domain trust chains...",
        "Requesting new OAuth2 authorization token from courier identity server...",
        "Dispatching encrypted connection connection packet to logistics gateway...",
        "Handshake established! Active connection verified with status 200 OK."
      ]
    }
  ]);

  // Active Notifications state (Initially 8 notifications, 4 unread, 4 read)
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "New Premium Order Secured",
      description: "Sarah Jenkins placed Order #ORD-4820 for Cloud Orthopedic Bed (₹189.00).",
      category: "sales",
      time: "10:14 AM",
      read: false
    },
    {
      id: "notif-2",
      title: "VIP Account Tier Upgrade",
      description: "Michael Chen spent ₹1,200+ and was automatically elevated to 'VIP Companion' status.",
      category: "customer",
      time: "08:32 AM",
      read: false
    },
    {
      id: "notif-3",
      title: "Secure Settlement Initiated",
      description: "Daily merchant sweep of ₹24,500.00 processed successfully to ending *8940.",
      category: "finance",
      time: "Yesterday",
      read: false
    },
    {
      id: "notif-4",
      title: "5-Star Review Published",
      description: "Emma Thompson left review: 'Absolutely stunning design and superior orthopedic density!'",
      category: "feedback",
      time: "Yesterday",
      read: false
    },
    {
      id: "notif-5",
      title: "Concierge Bespoke Inquiry",
      description: "David Rodriguez requested advice on sizing standard collars for an active Italian Greyhound.",
      category: "concierge",
      time: "May 14",
      read: true
    },
    {
      id: "notif-6",
      title: "Supplier Stock Update",
      description: "Aesop Hound confirmed delivery of raw tanned Italian leather batch #L-92.",
      category: "logistics",
      time: "May 13",
      read: true
    },
    {
      id: "notif-7",
      title: "Database Backup Completed",
      description: "Automated incremental recovery checkpoint successfully written to cloud backup zone.",
      category: "system",
      time: "May 12",
      read: true
    },
    {
      id: "notif-8",
      title: "Storefront Performance Milestone",
      description: "Lighthouse core web vitals scored a pristine 100/100 for desktop viewport rendering.",
      category: "performance",
      time: "May 11",
      read: true
    }
  ]);

  const activeErrorsCount = useMemo(() => errors.filter(e => !e.resolved).length, [errors]);
  const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const totalDiagnosticsCount = useMemo(() => activeErrorsCount + unreadNotificationsCount, [activeErrorsCount, unreadNotificationsCount]);

  // Run error debugging auto-simulation steps
  useEffect(() => {
    let interval: any;
    if (isDebugRunning && debuggingErrorId !== null) {
      const activeErr = errors.find(e => e.id === debuggingErrorId);
      if (activeErr) {
        interval = setInterval(() => {
          setDebugLogStep((prev) => {
            if (prev < activeErr.debugSteps.length - 1) {
              return prev + 1;
            } else {
              // Finished debugging! Resolve the error
              setIsDebugRunning(false);
              setErrors(prevErrors =>
                prevErrors.map(e => e.id === debuggingErrorId ? { ...e, resolved: true } : e)
              );
              clearInterval(interval);
              return prev;
            }
          });
        }, 1200);
      }
    }
    return () => clearInterval(interval);
  }, [isDebugRunning, debuggingErrorId, errors]);

  const startDebugging = (id: string) => {
    setDebuggingErrorId(id);
    setDebugLogStep(0);
    setIsDebugRunning(true);
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Interactive Table State
  const [adminOrders, setAdminOrders] = useState([
    { id: "#ORD-4820", customer: "Sarah Jenkins", item: "Cloud Orthopedic Bed (Large)", date: "Today, 10:14 AM", amount: 189.00, status: "Processing" },
    { id: "#ORD-4819", customer: "Michael Chen", item: "Artisan Ceramic Bowl (Sage)", date: "Today, 08:32 AM", amount: 48.00, status: "Processing" },
    { id: "#ORD-4818", customer: "Emma Thompson", item: "Woven Leather Leash (Terracotta)", date: "Yesterday", amount: 74.00, status: "Shipped" },
    { id: "#ORD-4817", customer: "David Rodriguez", item: "Premium Velvet Dog Bed", date: "May 14, 2026", amount: 220.00, status: "Shipped" },
    { id: "#ORD-4816", customer: "Sophia Gallagher", item: "Artisanal Treats Bundle", date: "May 13, 2026", amount: 35.00, status: "Delivered" },
  ]);

  // Highlighted index for the SVG Bar Chart
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(4); // Default to latest month

  // Chart data
  const revenueData = [
    { month: "Jan", revenue: 14200, orders: 198 },
    { month: "Feb", revenue: 16800, orders: 232 },
    { month: "Mar", revenue: 19500, orders: 280 },
    { month: "Apr", revenue: 21100, orders: 310 },
    { month: "May", revenue: 24500, orders: 342 },
  ];

  // Handler to fulfill order in mock table
  const handleFulfill = (id: string) => {
    setAdminOrders(
      adminOrders.map((o) => (o.id === id ? { ...o, status: o.status === "Processing" ? "Shipped" : "Delivered" } : o))
    );
  };

  // State for pending partner requests
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  const fetchPendingPartners = async () => {
    setPartnersLoading(true);
    setPartnersError(null);
    try {
      const res = await fetch("/api/admin/partners/pending", {
        headers: {
          "Authorization": "Bearer admin-token"
        }
      });
      if (!res.ok) throw new Error("Failed to fetch pending applications");
      const data = await res.json();
      setPendingPartners(data.pendingStores || []);
    } catch (err: any) {
      setPartnersError(err.message || String(err));
    } finally {
      setPartnersLoading(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === "partners") {
      fetchPendingPartners();
    }
  }, [activeAdminTab]);

  const handlePartnerAction = async (id: string, action: "APPROVE" | "REJECT") => {
    let rejectionReason = "";
    if (action === "REJECT") {
      rejectionReason = prompt("Please enter the reason for rejection:") || "";
      if (!rejectionReason) return;
    }

    try {
      const res = await fetch(`/api/admin/partners/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
        body: JSON.stringify({ action, rejectionReason })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to process application");
      }

      alert(`Application successfully ${action === "APPROVE" ? "approved" : "rejected"}.`);
      fetchPendingPartners();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream border-t border-brand-warm-gray">
      {/* Admin Top Header Area */}
      <header className="bg-white border-b border-brand-warm-gray/60 px-8 py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-terracotta animate-pulse"></span>
          <h1 className="text-lg font-display font-bold text-brand-charcoal uppercase tracking-wider">
            Elevated Pet — Admin Console
          </h1>
        </div>

        {/* Search, Notifications, Headshot */}
        <div className="flex items-center gap-5 justify-between sm:justify-end">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search administration database..."
              className="pl-9 pr-4 py-1.5 bg-brand-cream border border-brand-warm-gray/60 text-xs font-mono focus:outline-none focus:border-brand-sage w-64 rounded-none"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-charcoal/40" />
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification bell */}
            <button 
              id="admin-notification-bell"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-1.5 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors focus:outline-none"
              title="View Active Diagnostics & Notifications"
            >
              <Bell className="w-5 h-5" />
              {totalDiagnosticsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-terracotta text-white font-mono text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {totalDiagnosticsCount}
                </span>
              )}
            </button>

            {/* Diagnostics & Activity Dropdown */}
            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-10 w-96 max-w-[calc(100vw-32px)] bg-white border border-brand-charcoal shadow-xl z-50 text-left select-none"
                  style={{ transformOrigin: "top right" }}
                >
                  {/* Panel Header */}
                  <div className="p-4 bg-brand-charcoal text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-brand-sand animate-pulse" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        Boutique Diagnostics Center
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowNotifPanel(false);
                        setDebuggingErrorId(null);
                        setIsDebugRunning(false);
                      }}
                      className="p-1 hover:text-brand-terracotta transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex border-b border-brand-warm-gray font-mono text-[10px] uppercase tracking-wider bg-brand-cream/30">
                    <button
                      onClick={() => {
                        setPanelTab("errors");
                        setDebuggingErrorId(null);
                        setIsDebugRunning(false);
                      }}
                      className={`flex-1 py-2.5 text-center transition-colors font-bold flex items-center justify-center gap-1.5 ${
                        panelTab === "errors"
                          ? "bg-white text-brand-charcoal border-b-2 border-brand-terracotta"
                          : "text-brand-charcoal/50 hover:bg-brand-oatmeal/40"
                      }`}
                    >
                      <AlertTriangle className={`w-3.5 h-3.5 ${activeErrorsCount > 0 ? "text-brand-terracotta animate-bounce" : "text-brand-charcoal/40"}`} />
                      System Errors ({activeErrorsCount})
                    </button>
                    <button
                      onClick={() => {
                        setPanelTab("notifications");
                        setDebuggingErrorId(null);
                        setIsDebugRunning(false);
                      }}
                      className={`flex-1 py-2.5 text-center transition-colors font-bold flex items-center justify-center gap-1.5 ${
                        panelTab === "notifications"
                          ? "bg-white text-brand-charcoal border-b-2 border-brand-sage"
                          : "text-brand-charcoal/50 hover:bg-brand-oatmeal/40"
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5 text-brand-charcoal/40" />
                      Notifications ({unreadNotificationsCount})
                    </button>
                  </div>

                  {/* Panel Content Wrapper */}
                  <div className="max-h-[380px] overflow-y-auto p-4 space-y-4">
                    {panelTab === "errors" ? (
                      /* ERRORS DIAGNOSTICS VIEW */
                      debuggingErrorId !== null ? (
                        /* INTERACTIVE LOGS TERMINAL DEBUGGER */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-widest flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-brand-charcoal" /> Terminal C:\Diagnostics\Boutique
                            </span>
                            <button
                              onClick={() => {
                                setDebuggingErrorId(null);
                                setIsDebugRunning(false);
                              }}
                              className="text-[10px] font-mono text-brand-terracotta hover:underline font-bold"
                            >
                              Exit Debugger
                            </button>
                          </div>

                          <div className="bg-brand-charcoal text-emerald-400 p-4 font-mono text-[11px] leading-relaxed rounded-none space-y-2 min-h-[160px] shadow-inner select-text">
                            <div className="text-[#eae5db]/60 border-b border-white/10 pb-1.5 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-terracotta"></span>
                              <span>Target: {errors.find(e => e.id === debuggingErrorId)?.code}</span>
                            </div>
                            
                            {errors.find(e => e.id === debuggingErrorId)?.debugSteps.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                {idx <= debugLogStep ? (
                                  <>
                                    <span className="text-[#eae5db]/40">[{idx + 1}]</span>
                                    {idx === debugLogStep && isDebugRunning ? (
                                      <span className="text-brand-sand font-bold animate-pulse">⚙ {step}</span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <Check className="w-3 h-3 text-brand-sage stroke-[3]" /> {step}
                                      </span>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            ))}

                            {!isDebugRunning && (
                              <div className="pt-3 border-t border-white/10 mt-3 text-center">
                                <p className="text-brand-sand font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-brand-sage animate-bounce" /> Issue Cleanly Solved
                                </p>
                                <button
                                  onClick={() => {
                                    setDebuggingErrorId(null);
                                    setIsDebugRunning(false);
                                  }}
                                  className="mt-2.5 px-4 py-1.5 bg-brand-sand text-brand-charcoal hover:bg-white text-[10px] uppercase font-bold tracking-wider transition-colors duration-200"
                                >
                                  Return to List
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* ERRORS LIST */
                        <div className="space-y-3">
                          {errors.filter(e => !e.resolved).length > 0 ? (
                            errors.filter(e => !e.resolved).map((err) => (
                              <div 
                                key={err.id}
                                className="border-l-4 border-brand-terracotta bg-brand-terracotta/5 p-3.5 space-y-2 hover:bg-brand-terracotta/10 transition-colors"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-brand-terracotta shrink-0" />
                                    {err.title}
                                  </h4>
                                  <span className="text-[9px] font-mono text-brand-charcoal/40 shrink-0">{err.time}</span>
                                </div>
                                <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                                  {err.description}
                                </p>
                                <div className="flex justify-between items-center pt-1 border-t border-brand-warm-gray/40">
                                  <span className="text-[9px] font-mono uppercase bg-brand-terracotta/10 text-brand-terracotta px-1.5 py-0.5 font-bold">
                                    {err.code}
                                  </span>
                                  <button
                                    onClick={() => startDebugging(err.id)}
                                    className="px-3 py-1 bg-brand-terracotta text-white hover:bg-brand-charcoal transition-all text-[10px] font-mono uppercase tracking-wider font-bold"
                                  >
                                    Debug & Fix
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 space-y-2">
                              <CheckCircle2 className="w-10 h-10 text-brand-sage mx-auto" />
                              <h4 className="text-xs font-mono uppercase font-bold text-brand-charcoal">All Errors Debugged!</h4>
                              <p className="text-[11px] text-brand-charcoal/50 font-light">System is operating in pristine status.</p>
                            </div>
                          )
                        }
                        </div>
                      )
                    ) : (
                      /* NOTIFICATIONS VIEW */
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-widest pb-1 border-b border-brand-warm-gray/40">
                          <span>Recent Activity Feed</span>
                          {unreadNotificationsCount > 0 && (
                            <button 
                              onClick={markAllNotifsRead}
                              className="hover:text-brand-terracotta underline transition-colors"
                            >
                              Mark All Read
                            </button>
                          )}
                        </div>

                        {notifications.length > 0 ? (
                          <div className="space-y-2">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id}
                                className={`p-3 border border-brand-warm-gray/30 transition-all flex gap-3 relative group ${
                                  notif.read ? "bg-white opacity-60" : "bg-brand-cream/40 border-l-2 border-l-brand-sage"
                                }`}
                              >
                                <div className="space-y-1 flex-grow min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-xs text-brand-charcoal truncate ${notif.read ? "font-normal" : "font-bold"}`}>
                                      {notif.title}
                                    </h4>
                                    <span className="text-[9px] font-mono text-brand-charcoal/40 shrink-0">{notif.time}</span>
                                  </div>
                                  <p className="text-[11px] text-brand-charcoal/60 leading-relaxed font-light font-sans">
                                    {notif.description}
                                  </p>
                                  <div className="flex justify-between items-center pt-1 text-[9px] font-mono uppercase text-brand-charcoal/40">
                                    <span>#{notif.category}</span>
                                    {!notif.read && (
                                      <button 
                                        onClick={() => markNotifRead(notif.id)}
                                        className="text-brand-sage hover:text-brand-charcoal font-bold underline"
                                      >
                                        Mark Read
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteNotif(notif.id)}
                                  className="text-brand-charcoal/30 hover:text-brand-terracotta p-1 self-start transition-colors"
                                  title="Delete event"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 space-y-2">
                            <Bell className="w-10 h-10 text-brand-charcoal/20 mx-auto" />
                            <h4 className="text-xs font-mono uppercase font-bold text-brand-charcoal">No notifications</h4>
                            <p className="text-[11px] text-brand-charcoal/50 font-light font-mono">Archive is clean.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Panel Footer / Quick Status */}
                  <div className="p-3 border-t border-brand-warm-gray bg-brand-oatmeal/40 font-mono text-[9px] text-brand-charcoal/50 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Updated just now
                    </span>
                    <span className="font-bold text-brand-charcoal">
                      Secure Workspace V1.2
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manager Headshot */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-brand-warm-gray">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-warm-gray">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Pp6GwdYuglbHqR_po8pmoEHt31DNSszIknUi0O4QEz4Q3q4KofExM8fhvoxiJA0h5dCKYFxbqyF19B842buyximG-nw8au_TWRxfdIVVQSnpf_wTyyXNk3RF6pUiWFOBxOfoYcWTELQeMKHf7tSks_gDuqib9K_lLvpwgNPimy8F5_wRie5GeOxR3zGZ8tiRgFNy618Vr3ZLzU1BuBfw1KtjkwLRAYdQDuHJUxg6Y7IUBgfdw"
                  alt="Admin Headshot Manager"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left leading-none hidden sm:block">
                <span className="text-xs font-mono font-bold block text-brand-charcoal">Edward J.</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-brand-charcoal/40 block mt-0.5">Boutique Owner</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-70px)]">
        {/* Left Admin Navigation Sidebar Rail */}
        <aside className="lg:col-span-3 bg-white border-r border-brand-warm-gray/60 p-6 space-y-6">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-brand-charcoal/40 uppercase block mb-3">
              Management Core
            </span>
            <div className="space-y-1">
              {[
                { id: "overview", label: "Overview Metrics", icon: BarChart3 },
                { id: "products", label: "Inventory Items", icon: Package },
                { id: "orders", label: "Client Purchases", icon: DollarSign },
                { id: "customers", label: "Active Patrons", icon: Users },
                { id: "partners", label: "Partner Requests", icon: ShieldAlert },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveAdminTab(item.id as any)}
                    className={`w-full text-left py-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-3 rounded-none ${
                      activeAdminTab === item.id
                        ? "bg-brand-charcoal text-white font-bold"
                        : "text-brand-charcoal/70 hover:bg-brand-oatmeal/40 hover:text-brand-charcoal"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-warm-gray/60 space-y-4">
            <span className="text-[9px] font-mono tracking-widest text-brand-charcoal/40 uppercase block">
              Boutique Portal
            </span>
            <button
              onClick={() => onNavigate("storefront")}
              className="w-full text-left py-2 px-3 text-xs font-mono text-brand-terracotta hover:bg-brand-oatmeal/40 transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Return to Store
            </button>
            <button
              onClick={() => alert("Boutique Settings are configured dynamically based on environment configuration.")}
              className="w-full text-left py-2 px-3 text-xs font-mono text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-oatmeal/40 transition-all flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" /> General Settings
            </button>
          </div>
        </aside>

        {/* Main Admin Dashboard Workspace Area */}
        <main className="lg:col-span-9 p-6 md:p-8 space-y-8 min-w-0">
          {activeAdminTab === "overview" && (
            <>
              {/* TOP METRICS SUMMARY PANEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="bg-white border border-brand-warm-gray/40 p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50">
                      Total Revenue (Mo)
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 text-xs font-bold font-mono">
                      +12%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-mono font-bold text-brand-charcoal block">
                      ₹24,500.00
                    </span>
                    <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                      vs. ₹21,100.00 last month
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white border border-brand-warm-gray/40 p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50">
                      Total Orders
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 text-xs font-bold font-mono">
                      +8%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-mono font-bold text-brand-charcoal block">
                      342
                    </span>
                    <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                      vs. 310 completed last month
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white border border-brand-warm-gray/40 p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50">
                      New Patrons
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 text-xs font-bold font-mono">
                      +22%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-mono font-bold text-brand-charcoal block">
                      128
                    </span>
                    <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                      vs. 104 accounts registered
                    </span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white border border-brand-warm-gray/40 p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50">
                      Average Order Value
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 text-xs font-bold font-mono">
                      +2%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-mono font-bold text-brand-charcoal block">
                      ₹71.63
                    </span>
                    <span className="text-[10px] font-mono text-brand-charcoal/40 block">
                      vs. ₹69.95 standard baseline
                    </span>
                  </div>
                </div>
              </div>

              {/* PIXEL-PERFECT INTERACTIVE SVG BAR CHART */}
              <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-brand-warm-gray mb-8">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
                      Financial Performance
                    </span>
                    <h2 className="text-base font-display font-bold text-brand-charcoal">
                      Monthly Revenue Progression
                    </h2>
                  </div>

                  {activeBarIdx !== null && (
                    <div className="bg-brand-oatmeal px-3 py-1.5 border border-brand-warm-gray/60 font-mono text-[10px] text-brand-charcoal">
                      Highlight: <strong className="font-bold uppercase text-brand-terracotta">{revenueData[activeBarIdx].month}</strong> Revenue:{" "}
                      <strong className="font-bold text-brand-charcoal">₹{revenueData[activeBarIdx].revenue.toLocaleString()}</strong> ({revenueData[activeBarIdx].orders} Orders)
                    </div>
                  )}
                </div>

                {/* Custom SVG Bar Chart Container */}
                <div className="w-full h-72 flex flex-col justify-between pt-4">
                  <div className="flex-grow w-full relative flex items-end justify-between px-10 border-b border-brand-warm-gray/60 pb-2">
                    {/* Y-Axis Guidelines lines */}
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-brand-warm-gray/30 text-[9px] font-mono text-brand-charcoal/30 pt-0.5 pointer-events-none">
                      ₹25,000
                    </div>
                    <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-brand-warm-gray/30 text-[9px] font-mono text-brand-charcoal/30 pt-0.5 pointer-events-none">
                      ₹18,000
                    </div>
                    <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-brand-warm-gray/30 text-[9px] font-mono text-brand-charcoal/30 pt-0.5 pointer-events-none">
                      ₹10,000
                    </div>

                    {/* Bars map loop */}
                    {revenueData.map((data, idx) => {
                      const maxVal = 25000;
                      const pctHeight = (data.revenue / maxVal) * 100;

                      return (
                        <div
                          key={data.month}
                          onClick={() => setActiveBarIdx(idx)}
                          className="flex flex-col items-center group cursor-pointer w-20 relative z-10"
                        >
                          {/* Hover Tooltip box */}
                          <div className={`absolute -top-12 bg-brand-charcoal text-white text-[10px] font-mono px-2.5 py-1.5 shadow-xl rounded-none pointer-events-none transition-all duration-200 flex flex-col items-center leading-tight whitespace-nowrap z-50 ${
                            activeBarIdx === idx ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                          }`}>
                            <span className="font-bold">{data.month}: ₹{data.revenue.toLocaleString()}</span>
                            <span className="text-brand-sand font-light text-[9px] mt-0.5">{data.orders} Completed Orders</span>
                          </div>

                          {/* Interactive Bar graphic */}
                          <div
                            style={{ height: `${pctHeight}%` }}
                            className={`w-12 transition-all duration-500 rounded-none relative overflow-hidden ${
                              activeBarIdx === idx
                                ? "bg-brand-terracotta border-b-4 border-brand-terracotta-dark shadow-md"
                                : "bg-brand-sage/75 group-hover:bg-brand-sage hover:shadow-lg"
                            }`}
                          >
                            {/* Accent lighting lines */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-white/20"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis labels strip */}
                  <div className="flex justify-between px-10 pt-3 text-[11px] font-mono font-bold text-brand-charcoal/50 uppercase tracking-widest">
                    {revenueData.map((data, idx) => (
                      <span
                        key={data.month}
                        onClick={() => setActiveBarIdx(idx)}
                        className={`w-20 text-center cursor-pointer transition-colors ${
                          activeBarIdx === idx ? "text-brand-terracotta font-extrabold underline underline-offset-4" : "hover:text-brand-charcoal"
                        }`}
                      >
                        {data.month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE INTERACTIVE CONTROL */}
              <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-brand-warm-gray mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-brand-sage uppercase block mb-1">
                      Audit Stream
                    </span>
                    <h2 className="text-base font-display font-bold text-brand-charcoal">
                      Real-Time Store Transactions
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-brand-charcoal/40">
                    Click actions to mock state updates
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-warm-gray uppercase text-brand-charcoal/50 text-[10px]">
                        <th className="py-3 px-3">Order Code</th>
                        <th className="py-3 px-3">Patron Name</th>
                        <th className="py-3 px-3">Component Piece</th>
                        <th className="py-3 px-3 text-center">Amount</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-warm-gray/30 text-brand-charcoal/80">
                      {adminOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-brand-cream/35 transition-colors">
                          <td className="py-4 px-3 font-bold text-brand-charcoal">{ord.id}</td>
                          <td className="py-4 px-3 font-semibold">{ord.customer}</td>
                          <td className="py-4 px-3 font-light max-w-xs truncate">{ord.item}</td>
                          <td className="py-4 px-3 text-center font-bold text-brand-charcoal">₹{ord.amount.toFixed(2)}</td>
                          <td className="py-4 px-3 text-center">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                              ord.status === "Delivered"
                                ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                                : ord.status === "Shipped"
                                ? "text-sky-800 bg-sky-50 border border-sky-200"
                                : "text-amber-800 bg-amber-50 border border-amber-200"
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            {ord.status !== "Delivered" ? (
                              <button
                                onClick={() => handleFulfill(ord.id)}
                                className="px-2.5 py-1 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-[10px] uppercase font-bold tracking-wider"
                              >
                                {ord.status === "Processing" ? "Ship Item" : "Deliver"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-brand-sage font-bold flex items-center justify-end gap-1 select-none">
                                <Check className="w-3.5 h-3.5" /> Fully Met
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeAdminTab === "products" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-display font-bold text-brand-charcoal pb-4 border-b border-brand-warm-gray">
                Inventory Database Management
              </h2>
              <p className="text-xs text-brand-charcoal/60 font-mono">
                Store inventory synced automatically with client storefront. All active sizes, fabric variations, and product pricing parameters are fetched in real-time.
              </p>

              <div className="border border-brand-warm-gray/60">
                <div className="grid grid-cols-12 text-xs font-mono uppercase text-brand-charcoal/50 p-3 bg-brand-oatmeal border-b border-brand-warm-gray/60">
                  <span className="col-span-6">Catalog Title</span>
                  <span className="col-span-2 text-center">Standard Price</span>
                  <span className="col-span-2 text-center">Reviews</span>
                  <span className="col-span-2 text-right">Action</span>
                </div>
                <div className="divide-y divide-brand-warm-gray/40">
                  {[
                    { name: "Cloud Orthopedic Bed", price: 189.00, reviews: 124, brand: "Wild One" },
                    { name: "Artisan Ceramic Bowl", price: 48.00, reviews: 89, brand: "Aesop Hound" },
                    { name: "Woven Leather Leash", price: 74.00, reviews: 56, brand: "Wild One" },
                    { name: "Premium Velvet Dog Bed", price: 220.00, reviews: 42, brand: "Aesop Hound" },
                    { name: "Artisanal Treats Bundle", price: 35.00, reviews: 165, brand: "The Paws Store" },
                  ].map((p, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-xs font-mono p-4 items-center text-brand-charcoal">
                      <div className="col-span-6 space-y-0.5">
                        <span className="font-bold text-brand-charcoal block text-sm">{p.name}</span>
                        <span className="text-brand-charcoal/40 text-[10px] uppercase block">{p.brand}</span>
                      </div>
                      <span className="col-span-2 text-center font-bold">₹{p.price.toFixed(2)}</span>
                      <span className="col-span-2 text-center font-bold text-brand-terracotta">{p.reviews} Ratings</span>
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => alert(`Active catalog editing for '${p.name}' is mock-persisted.`)}
                          className="px-2 py-1 border border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal uppercase tracking-widest text-[9px] font-bold"
                        >
                          Modify SKU
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeAdminTab === "orders" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-display font-bold text-brand-charcoal pb-4 border-b border-brand-warm-gray">
                Purchase Order Archive Database
              </h2>
              <div className="border border-brand-warm-gray/60 p-4 font-mono text-xs text-brand-charcoal bg-brand-cream/40">
                <p>• Connected API routes: <code className="bg-brand-warm-gray px-1">/api/orders</code></p>
                <p className="mt-1">• Secure database persistence: <strong className="font-bold">Active and Healthy</strong></p>
              </div>

              <div className="divide-y divide-brand-warm-gray/30 space-y-3">
                {adminOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-brand-oatmeal/20 border border-brand-warm-gray/30 flex justify-between items-center font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-charcoal">{ord.id}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-brand-charcoal text-white uppercase">{ord.status}</span>
                      </div>
                      <p className="text-brand-charcoal/60">Placed by <strong className="text-brand-charcoal font-semibold">{ord.customer}</strong> on {ord.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-brand-charcoal block">₹{ord.amount.toFixed(2)}</span>
                      <p className="text-[10px] text-brand-charcoal/50 italic">{ord.item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminTab === "customers" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-display font-bold text-brand-charcoal pb-4 border-b border-brand-warm-gray">
                Registered Boutique Patrons
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-brand-charcoal">
                {[
                  { name: "Sarah Jenkins", email: "sarah.jenkins@gmail.com", joined: "Jan 12, 2026", status: "VIP Patron" },
                  { name: "Michael Chen", email: "m.chen@outlook.com", joined: "Feb 02, 2026", status: "Regular Tier" },
                  { name: "Emma Thompson", email: "emma.thompson@gmail.com", joined: "Mar 18, 2026", status: "VIP Patron" },
                  { name: "David Rodriguez", email: "david.rod@yahoo.com", joined: "Apr 05, 2026", status: "Regular Tier" },
                ].map((c, idx) => (
                  <div key={idx} className="border border-brand-warm-gray p-4 flex justify-between items-center bg-white">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-brand-charcoal">{c.name}</h3>
                      <p className="text-brand-charcoal/60">{c.email}</p>
                      <p className="text-[10px] text-brand-charcoal/40">Joined {c.joined}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 ${
                      c.status === "VIP Patron" ? "text-brand-terracotta bg-red-50 border border-brand-terracotta/30" : "text-brand-charcoal bg-brand-oatmeal"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminTab === "partners" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-display font-bold text-brand-charcoal pb-4 border-b border-brand-warm-gray">
                Partner Store Registration Requests
              </h2>
              <p className="text-xs text-brand-charcoal/60 font-mono">
                Review and manage onboarding applications submitted by boutique vendors. Approving an application will set the user role to PARTNER and activate their store.
              </p>

              {partnersLoading ? (
                <div className="text-center font-mono text-xs py-8">Loading pending applications...</div>
              ) : partnersError ? (
                <div className="p-3 bg-brand-terracotta/10 border-l-2 border-brand-terracotta text-brand-terracotta font-mono text-xs">
                  Error: {partnersError}
                </div>
              ) : pendingPartners.length === 0 ? (
                <div className="text-center py-10 space-y-2 border border-dashed border-brand-warm-gray/60 font-mono text-xs">
                  <Check className="w-8 h-8 text-brand-sage mx-auto" />
                  <h4 className="font-bold text-brand-charcoal">All Clear!</h4>
                  <p className="text-brand-charcoal/50">No pending partner applications in the queue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPartners.map((store) => (
                    <div key={store.id} className="p-5 border border-brand-warm-gray bg-[#FDFBF7] hover:bg-brand-oatmeal/20 transition-all font-mono text-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-brand-charcoal">{store.businessName}</h3>
                          <span className="text-[10px] text-brand-charcoal/50">Owner: {store.owner?.name || "Applicant"} ({store.owner?.email})</span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200">
                          {store.approvalStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-brand-charcoal/70 text-[11px] pt-1">
                        <div>📍 <strong>Address:</strong> {store.address}</div>
                        <div>📄 <strong>Tax ID:</strong> {store.taxId || "N/A"}</div>
                        {store.lat && store.lng && (
                          <div className="md:col-span-2">🌐 <strong>Coordinates:</strong> Lat: {store.lat}, Lng: {store.lng}</div>
                        )}
                      </div>

                      <div className="flex gap-2.5 pt-2 border-t border-brand-warm-gray/40">
                        <button
                          onClick={() => handlePartnerAction(store.id, "APPROVE")}
                          className="px-4 py-1.5 bg-brand-sage text-white hover:bg-brand-charcoal transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Approve Store
                        </button>
                        <button
                          onClick={() => handlePartnerAction(store.id, "REJECT")}
                          className="px-4 py-1.5 border border-brand-terracotta text-brand-terracotta hover:bg-brand-terracotta hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
