/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { ShoppingBag, User, ShieldAlert, Sparkles, Heart, Search, HelpCircle, LogOut, X, Clock, Trash2, Mic, MicOff, Info, ChevronRight, Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MOCK_PRODUCTS, Product, CartItem, StockNotification } from "./types";
import Storefront from "./components/Storefront";
import ShopAll from "./components/ShopAll";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AuthSplit from "./components/AuthSplit";
import ConciergeSearch from "./components/ConciergeSearch";
import FelineSpaceHarmonizer from "./components/FelineSpaceHarmonizer";
import ConfirmationModal from "./components/ConfirmationModal";
import NotifyMeModal from "./components/NotifyMeModal";
import PartnerOnboarding from "./components/Partner/PartnerOnboarding";
import PartnerDashboard from "./components/Partner/PartnerDashboard";
import AdminApprovalQueue from "./components/Admin/AdminApprovalQueue";
import { useLocalStorageSync } from "./components/useLocalStorageRefresh";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("storefront");
  const [selectedProductId, setSelectedProductId] = useState<string>("cloud-bed");
  const [customerSubTab, setCustomerSubTab] = useState<"dashboard" | "orders" | "wishlist" | "addresses">("dashboard");

  // Authentication Context State
  const [currentUser, setCurrentUser] = useLocalStorageSync<string | null>("curated_current_user", "Sarah");
  const [authToken, setAuthToken] = useLocalStorageSync<string | null>("curated_auth_token", null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Auto-generate JWT for the default seeded user on first load
  const ensureAuthToken = async (userName: string) => {
    try {
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "sarah.curator@example.com", password: "demo" })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.accessToken) {
          setAuthToken(loginData.accessToken);
          return loginData.accessToken;
        }
      }
    } catch (err) {
      console.error("Auto-login failed:", err);
    }
    return null;
  };

  const fetchUserProfile = async () => {
    if (!currentUser) {
      setCurrentUserProfile(null);
      return;
    }
    try {
      const res = await fetch("/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${authToken || currentUser}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserProfile(data);
      } else {
        setCurrentUserProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setCurrentUserProfile(null);
    }
  };

  // On boot: if currentUser is set but no authToken, auto-login to get JWT
  useEffect(() => {
    if (currentUser && !authToken) {
      ensureAuthToken(currentUser);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [currentUser, authToken]);

  // Wishlist / Favorites State
  const [favorites, setFavorites] = useLocalStorageSync<string[]>("curated_favorites", ["cloud-bed", "artisanal-treats"]);

  // Stock Notifications State in localStorage
  const [notifications, setNotifications] = useLocalStorageSync<StockNotification[]>("notifications", []);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);

  const handleOpenNotifyModal = (product: Product) => {
    setNotifyProduct(product);
  };

  const handleAddNotification = (product: Product, email: string) => {
    const newNotif: StockNotification = {
      id: `notif-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      email,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRemoveNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      return next;
    });
  };

  // Global search & Recent Searches state
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [recentSearches, setRecentSearches] = useLocalStorageSync<string[]>("curated_recent_searches", ["Velvet Bed", "Ceramic Bowl", "Organic Treats"]);
  const [isConfirmClearSearchOpen, setIsConfirmClearSearchOpen] = useState(false);

  // Computed Autocomplete Product Suggestions from MOCK_PRODUCTS
  const autocompleteSuggestions = useMemo(() => {
    const query = searchInputVal.trim().toLowerCase();
    if (!query) return [];
    return MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchInputVal]);

  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setGlobalSearchQuery(trimmed);
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 5);
      return next;
    });
    handleNavigate("shop");
    setSearchOpen(false);
  };

  const handleDeleteRecentSearch = (e: React.MouseEvent, itemToDelete: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== itemToDelete);
      return next;
    });
  };

  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  // Web Speech API for Curated Search Overlay
  const [isListeningSearch, setIsListeningSearch] = useState<boolean>(false);
  const [speechSupportedSearch, setSpeechSupportedSearch] = useState<boolean>(true);
  const [speechErrorSearch, setSpeechErrorSearch] = useState<string>("");
  const [recognitionSearch, setRecognitionSearch] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupportedSearch(false);
    }
  }, []);

  const startListeningSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupportedSearch(false);
      setSpeechErrorSearch("Speech recognition not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListeningSearch(true);
        setSpeechErrorSearch("");
      };

      rec.onerror = (event: any) => {
        console.error("Search speech error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechErrorSearch("Microphone permission denied.");
        } else {
          setSpeechErrorSearch(`Microphone error: ${event.error}`);
        }
        setIsListeningSearch(false);
      };

      rec.onend = () => {
        setIsListeningSearch(false);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setSearchInputVal(currentText);
        }

        if (finalTranscript) {
          setTimeout(() => {
            handleSearchSubmit(finalTranscript);
          }, 800);
        }
      };

      rec.start();
      setRecognitionSearch(rec);
    } catch (err: any) {
      console.error(err);
      setSpeechErrorSearch("Failed to initialize speech.");
      setIsListeningSearch(false);
    }
  };

  const stopListeningSearch = () => {
    if (recognitionSearch) {
      try {
        recognitionSearch.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsListeningSearch(false);
  };

  const toggleListeningSearch = () => {
    if (isListeningSearch) {
      stopListeningSearch();
    } else {
      startListeningSearch();
    }
  };

  // Stop recording if the search overlay is closed
  useEffect(() => {
    if (!searchOpen && isListeningSearch) {
      stopListeningSearch();
    }
  }, [searchOpen]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionSearch) {
        try {
          recognitionSearch.stop();
        } catch (err) {
          console.error(err);
        }
      }
    };
  }, [recognitionSearch]);

  // Cart State (Pre-populate with items to match Sarah's screen initial state!)
  const [cart, setCart] = useLocalStorageSync<CartItem[]>("curated_cart", [
    {
      id: "premium-velvet-bed-Medium-Sapphire Velvet",
      product: MOCK_PRODUCTS.find((p) => p.id === "premium-velvet-bed") || MOCK_PRODUCTS[3],
      quantity: 1,
      selectedSize: "Medium",
      selectedColor: { name: "Sapphire Velvet", value: "#1A365D" },
    },
    {
      id: "artisanal-treats-Default-Default",
      product: MOCK_PRODUCTS.find((p) => p.id === "artisanal-treats") || MOCK_PRODUCTS[4],
      quantity: 1,
      selectedSize: "Standard",
      selectedColor: { name: "Default", value: "#000" },
    },
  ]);

  // Global applied discount promo
  const [discount, setDiscount] = useState<{ code: string; percent: number }>({ code: "", percent: 0 });

  // Dynamically count total cart items for badge
  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Product helper lookup
  const currentProduct = useMemo(() => {
    return MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];
  }, [selectedProductId]);

  // Related products helper
  const relatedProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.id !== selectedProductId);
  }, [selectedProductId]);

  // Helper: Navigate to specific screen
  const handleNavigate = (tab: string, productId?: string) => {
    setActiveTab(tab);
    if (productId) {
      if (tab === "customer-portal" && ["dashboard", "orders", "wishlist", "addresses"].includes(productId)) {
        setCustomerSubTab(productId as any);
      } else {
        setSelectedProductId(productId);
      }
    }
    // Scroll smoothly to top on page transitions
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper: Add item to cart
  const handleAddToCart = (product: Product, size?: string, color?: { name: string; value: string }, giftNote?: string) => {
    const sSize = size || (product.sizes ? product.sizes[0] : "Standard");
    const sColor = color || (product.colors ? product.colors[0] : { name: "Default", value: "#000" });
    const compoundId = `${product.id}-${sSize}-${sColor.name}-${giftNote ? encodeURIComponent(giftNote) : ""}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === compoundId);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: compoundId,
            product,
            quantity: 1,
            selectedSize: sSize,
            selectedColor: sColor,
            giftNote,
          },
        ];
      }
    });
  };

  // Helper: Update Quantity in Cart
  const handleUpdateCartQty = (id: string, qty: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  // Helper: Remove Item from Cart
  const handleRemoveCartItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Helper: Clear Cart (on successful order)
  const handleClearCart = () => {
    setCart([]);
    setDiscount({ code: "", percent: 0 });
  };

  const handleApplyDiscount = (code: string, pct: number) => {
    setDiscount({ code, percent: pct });
  };

  const handleLoginSuccess = (userName: string, token?: string) => {
    setCurrentUser(userName);
    if (token) {
      setAuthToken(token);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    alert("You have logged out of the boutique portal.");
    setActiveTab("storefront");
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans">
      {/* BOUTIQUE SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-charcoal/40 backdrop-blur-md flex items-start justify-center p-4 md:p-6"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -50, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="bg-white w-full max-w-2xl mt-12 md:mt-24 p-6 md:p-8 border border-brand-warm-gray/60 shadow-2xl relative rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors cursor-pointer"
                title="Close Search"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-terracotta font-bold">
                    Curated Collection Search
                  </span>
                  <h3 className="text-xl font-display font-medium text-brand-charcoal tracking-tight mt-1">
                    What refined item are you looking for?
                  </h3>
                </div>

                {/* Input Bar */}
                <div className={`relative flex items-center border-b-2 transition-all duration-300 py-3 ${
                  isListeningSearch 
                    ? "border-brand-terracotta bg-brand-terracotta/5 px-3" 
                    : "border-brand-charcoal"
                }`}>
                  <div className="relative flex items-center justify-center mr-3 shrink-0">
                    {isListeningSearch ? (
                      <div className="relative flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75"></span>
                        <Mic className="w-5 h-5 text-brand-terracotta relative z-10" />
                      </div>
                    ) : (
                      <Search className="w-5 h-5 text-brand-charcoal/40 shrink-0" />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder={isListeningSearch ? "Listening carefully... speak now" : "Search by keywords (e.g. bed, stoneware, treats, organic...)"}
                    value={searchInputVal}
                    onChange={(e) => setSearchInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(searchInputVal);
                      }
                    }}
                    className={`w-full bg-transparent text-lg md:text-xl font-display font-medium text-brand-charcoal placeholder:text-brand-charcoal/25 focus:outline-none transition-all duration-300 ${
                      isListeningSearch ? "text-brand-terracotta font-semibold" : ""
                    }`}
                    autoFocus
                  />

                  <div className="flex items-center gap-2.5 shrink-0">
                    {searchInputVal && (
                      <button
                        onClick={() => setSearchInputVal("")}
                        className="p-1 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors cursor-pointer"
                        title="Clear text"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Microphone Trigger Button */}
                    {speechSupportedSearch && (
                      <button
                        type="button"
                        onClick={toggleListeningSearch}
                        className={`p-1.5 transition-all duration-300 rounded-none flex items-center justify-center cursor-pointer relative ${
                          isListeningSearch
                            ? "text-brand-terracotta bg-brand-terracotta/10 scale-110"
                            : "text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-cream"
                        }`}
                        title={isListeningSearch ? "Stop Voice Search" : "Search with Microphone"}
                      >
                        {isListeningSearch ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                        {isListeningSearch && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-terracotta"></span>
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Speech status/error banner */}
                {isListeningSearch && (
                  <div className="text-[10px] font-mono text-brand-terracotta flex items-center gap-2 bg-brand-terracotta/5 px-3.5 py-2 border-l-2 border-brand-terracotta animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-terracotta"></span>
                    </span>
                    <span>Microphone active. Speak search keywords (e.g., "velvet bed" or "stoneware"). Search triggers automatically on pause.</span>
                  </div>
                )}

                {speechErrorSearch && (
                  <div className="text-[10px] font-mono text-brand-terracotta flex items-center gap-2 bg-brand-terracotta/10 px-3.5 py-2 border-l-2 border-brand-terracotta">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{speechErrorSearch}</span>
                  </div>
                )}

                {/* LIVE AUTOCOMPLETE PRODUCT SUGGESTIONS DROPDOWN */}
                {searchInputVal.trim().length > 0 && (
                  <div className="bg-brand-cream/60 border border-brand-warm-gray p-3.5 space-y-2 font-mono text-xs animate-fadeIn shadow-xs">
                    <div className="flex items-center justify-between text-[10px] text-brand-charcoal/60 uppercase tracking-wider font-bold border-b border-brand-warm-gray/40 pb-2">
                      <span className="flex items-center gap-1.5 text-brand-terracotta">
                        <Sparkles className="w-3.5 h-3.5 fill-brand-terracotta" />
                        Product Autocomplete ({autocompleteSuggestions.length} found)
                      </span>
                      <span>Click to view product</span>
                    </div>

                    {autocompleteSuggestions.length > 0 ? (
                      <div className="divide-y divide-brand-warm-gray/30 bg-white border border-brand-warm-gray/40">
                        {autocompleteSuggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              handleSearchSubmit(item.name);
                              handleNavigate("product-details", item.id);
                              setSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2.5 hover:bg-brand-oatmeal/60 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover border border-brand-warm-gray shrink-0"
                              />
                              <div className="truncate">
                                <div className="font-display font-medium text-sm text-brand-charcoal group-hover:text-brand-terracotta truncate">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-brand-charcoal/60 flex items-center gap-2">
                                  <span className="uppercase font-semibold tracking-wider text-brand-terracotta">{item.brand}</span>
                                  <span>•</span>
                                  <span className="capitalize">{item.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className="font-bold text-brand-charcoal font-sans text-xs">${item.price.toFixed(2)}</span>
                              <ChevronRight className="w-4 h-4 text-brand-charcoal/30 group-hover:text-brand-terracotta group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-brand-charcoal/50 bg-white border border-brand-warm-gray/30 italic text-[11px]">
                        No direct product matches for "{searchInputVal}". Press Enter to perform global search.
                      </div>
                    )}
                  </div>
                )}

                {/* Grid for Recents & Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  {/* Recent Searches column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/40 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-charcoal/30" />
                        Recent Searches
                      </h4>
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsConfirmClearSearchOpen(true)}
                          className="text-[9px] font-mono text-brand-terracotta/75 hover:text-brand-terracotta uppercase tracking-wider font-bold transition-colors cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {recentSearches.length > 0 ? (
                      <div className="space-y-1">
                        {recentSearches.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSearchSubmit(item)}
                            className="group flex items-center justify-between text-xs font-mono text-brand-charcoal/80 hover:text-brand-terracotta cursor-pointer py-2 px-2.5 hover:bg-brand-cream/40 border-b border-brand-warm-gray/20 transition-all duration-200"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-brand-warm-gray/60 rounded-full group-hover:bg-brand-terracotta transition-colors shrink-0"></span>
                              <span className="truncate">{item}</span>
                            </span>
                            <button
                              onClick={(e) => handleDeleteRecentSearch(e, item)}
                              className="md:opacity-0 group-hover:opacity-100 p-1 text-brand-charcoal/30 hover:text-brand-terracotta transition-all rounded-full hover:bg-brand-cream"
                              title="Delete item"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center border border-dashed border-brand-warm-gray/50 bg-brand-cream/10">
                        <p className="text-[11px] font-mono text-brand-charcoal/40 italic">
                          No recent searches logged.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Refined Suggestions column */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/40 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-sand fill-brand-sand shrink-0" />
                      Refined Suggestions
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Velvet Bed",
                        "Stoneware Dinnerware",
                        "Sustainable",
                        "Orthotic",
                        "Feline",
                        "Meadow Balm",
                        "Sapphire",
                        "Artisanal"
                      ].map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchSubmit(term)}
                          className="px-3 py-2 bg-[#FDFBF7] hover:bg-brand-terracotta/5 border border-brand-warm-gray hover:border-brand-terracotta text-brand-charcoal hover:text-brand-terracotta text-[11px] font-mono transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-brand-charcoal/50 leading-relaxed font-light pt-2">
                      Need a full conversational AI curation experience? Try our dedicated <button onClick={() => { setSearchOpen(false); handleNavigate("concierge-search"); }} className="text-brand-terracotta font-mono font-bold hover:underline">Concierge AI Search</button> for deep, contextual recommendations.
                    </p>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-4 border-t border-brand-warm-gray/40 flex items-center justify-between text-[10px] font-mono text-brand-charcoal/30">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-brand-cream border border-brand-warm-gray rounded text-[9px]">Enter</kbd> to execute search</span>
                  <span>Esc to close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL FOR CLEARING SEARCH HISTORY */}
      <ConfirmationModal
        isOpen={isConfirmClearSearchOpen}
        title="Clear Search History?"
        message={`Are you sure you want to remove all ${recentSearches.length} recent search terms? This will clear your saved search history.`}
        confirmText="Clear History"
        cancelText="Keep History"
        variant="danger"
        onCancel={() => setIsConfirmClearSearchOpen(false)}
        onConfirm={() => {
          handleClearAllRecentSearches();
          setIsConfirmClearSearchOpen(false);
        }}
      />

      {/* NOTIFY ME WHEN AVAILABLE MODAL */}
      <NotifyMeModal
        product={notifyProduct}
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        onSubmit={handleAddNotification}
      />

      {/* GLOBAL HIGH-END NOTIFICATION RIBBON */}
      <div className="bg-[#1C1C1A] text-[#EAE5DB] py-2 px-6 text-center text-[10px] font-mono tracking-widest uppercase flex items-center justify-center gap-3 border-b border-brand-warm-gray/10 select-none">
        <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
        <span>Complimentary Standard White-Glove Shipping on all seasonal selections above ₹150</span>
        <span className="hidden md:inline text-brand-sand">•</span>
        <span className="hidden md:inline">Use Invitation Code: <strong>ELEVATE10</strong> for 10% premium credit</span>
      </div>

      {/* CORE BOUTIQUE NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-warm-gray/60 px-6 md:px-12 py-5 flex items-center justify-between">
        {/* Left Side: Brand Name Logo */}
        <div
          onClick={() => handleNavigate("storefront")}
          className="cursor-pointer group flex flex-col select-none"
        >
          <span className="text-[9px] font-mono tracking-widest text-brand-charcoal/50 uppercase leading-none mb-1 group-hover:text-brand-terracotta transition-colors">
            Est. 2026 — Curated living
          </span>
          <h1 className="text-xl md:text-2xl font-display font-bold text-brand-charcoal tracking-tight group-hover:text-brand-terracotta transition-colors">
            The Paws Store
          </h1>
        </div>

        {/* Center: Curated Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-brand-charcoal/70">
          <button
            onClick={() => {
              setGlobalSearchQuery("");
              handleNavigate("shop");
            }}
            className={`hover:text-brand-terracotta transition-colors ${
              activeTab === "shop" ? "text-brand-terracotta font-extrabold border-b border-brand-terracotta" : ""
            }`}
          >
            Shop All
          </button>
          <button
            onClick={() => handleNavigate("shop")}
            className="hover:text-brand-terracotta transition-colors"
          >
            Dogs
          </button>
          <button
            onClick={() => handleNavigate("shop")}
            className="hover:text-brand-terracotta transition-colors"
          >
            Cats
          </button>
          <button
            onClick={() => {
              setGlobalSearchQuery("");
              handleNavigate("shop");
            }}
            className="hover:text-brand-terracotta transition-colors text-brand-terracotta font-semibold"
          >
            New Arrivals
          </button>
          <button
            onClick={() => handleNavigate("shop")}
            className="hover:text-brand-terracotta transition-colors text-brand-sage font-semibold"
          >
            Eco-Friendly
          </button>
          <button
            onClick={() => handleNavigate("harmonizer")}
            className={`hover:text-brand-terracotta transition-colors font-semibold ${
              activeTab === "harmonizer" ? "text-brand-terracotta font-extrabold border-b border-brand-terracotta" : "text-brand-terracotta"
            }`}
          >
            Feline Harmonizer
          </button>
          <button
            onClick={() => handleNavigate("concierge-search")}
            className={`hover:text-brand-terracotta transition-colors flex items-center gap-1 font-semibold ${
              activeTab === "concierge-search" ? "text-brand-terracotta font-extrabold border-b border-brand-terracotta" : "text-brand-terracotta"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Concierge AI Search
          </button>
        </nav>

        {/* Right Side: Interactive Utilities */}
        <div className="flex items-center gap-4">
          {/* Quick search button */}
          <button
            onClick={() => {
              setSearchInputVal(globalSearchQuery);
              setSearchOpen(true);
            }}
            className="p-1.5 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors block"
            title="Open Curated Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Admin Switchers */}
          {(currentUserProfile?.role === "ADMIN" || currentUser?.toLowerCase().includes("admin")) && (
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate("admin")}
                className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-wider transition-all hidden md:block ${
                  activeTab === "admin"
                    ? "bg-brand-charcoal text-white border-brand-charcoal"
                    : "border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal"
                }`}
                title="Open Admin Dashboard"
              >
                Admin Panel
              </button>
              <button
                onClick={() => handleNavigate("admin-approvals")}
                className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-wider transition-all hidden md:block ${
                  activeTab === "admin-approvals"
                    ? "bg-brand-charcoal text-white border-brand-charcoal"
                    : "border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal"
                }`}
                title="Open Admin Approvals Queue"
              >
                Approval Queue
              </button>
            </div>
          )}

          {/* User Account / Profile Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate(currentUserProfile?.role === "PARTNER" ? "partner-inventory" : "customer-portal")}
                className={`flex items-center gap-1.5 p-1.5 text-xs font-mono text-brand-charcoal/80 hover:text-brand-charcoal transition-colors uppercase ${
                  activeTab === "customer-portal" || activeTab === "partner-inventory" ? "text-brand-terracotta font-bold underline" : ""
                }`}
                title={currentUserProfile?.role === "PARTNER" ? "View Partner Workspace" : `View ${currentUser}'s Account Dashboard`}
              >
                <User className="w-4 h-4 text-brand-terracotta" />
                <span className="hidden sm:inline font-semibold">{currentUser}</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1 text-brand-charcoal/40 hover:text-brand-terracotta transition-colors hidden sm:block"
                title="Log out of VIP Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate("auth")}
              className="flex items-center gap-1.5 p-1.5 text-xs font-mono text-brand-charcoal/60 hover:text-brand-charcoal transition-colors uppercase"
              title="Sign in / Sign up"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Favorites Header Link */}
          <button
            onClick={() => handleNavigate("customer-portal", "wishlist")}
            className="relative p-2 text-brand-charcoal/60 hover:text-brand-terracotta transition-colors cursor-pointer"
            title="View My Favorites"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? "fill-brand-terracotta text-brand-terracotta" : ""}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-terracotta text-white font-mono text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Shopping Cart Icon & Dynamic Badge */}
          <button
            onClick={() => handleNavigate("cart")}
            className="relative p-2 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors shadow-sm cursor-pointer"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-terracotta text-white font-mono text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE SCREEN VIEW SWITCHER */}
      <main className="flex-grow">
        {activeTab === "storefront" && (
          <Storefront
            onNavigate={handleNavigate}
            featuredProducts={MOCK_PRODUCTS}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === "shop" && (
          <ShopAll
            products={MOCK_PRODUCTS}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            searchQuery={globalSearchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenNotifyModal={handleOpenNotifyModal}
          />
        )}

        {activeTab === "details" && (
          <ProductDetails
            product={currentProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            relatedProducts={relatedProducts}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            currentUser={currentUser}
            onOpenNotifyModal={handleOpenNotifyModal}
          />
        )}

        {activeTab === "cart" && (
          <Cart
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={handleNavigate}
            onApplyDiscount={handleApplyDiscount}
            discount={discount}
          />
        )}

        {activeTab === "checkout" && (
          <Checkout
            cartItems={cart}
            discount={discount}
            currentUser={currentUser}
            authToken={authToken}
            onLoginSuccess={(name, token) => handleLoginSuccess(name, token)}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === "customer-portal" && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            products={MOCK_PRODUCTS}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            initialTab={customerSubTab}
            notifications={notifications}
            onRemoveNotification={handleRemoveNotification}
          />
        )}

        {activeTab === "admin" && <AdminDashboard onNavigate={handleNavigate} />}

        {activeTab === "concierge-search" && <ConciergeSearch />}

        {activeTab === "harmonizer" && (
          <FelineSpaceHarmonizer
            products={MOCK_PRODUCTS}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === "onboarding" && (
          <PartnerOnboarding
            onNavigate={handleNavigate}
            currentUser={currentUserProfile}
            onRefreshUser={fetchUserProfile}
          />
        )}

        {activeTab === "admin-approvals" && (
          <AdminApprovalQueue currentUser={currentUserProfile} />
        )}

        {activeTab === "partner-inventory" && (
          <PartnerDashboard
            currentUser={currentUserProfile}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === "auth" && (
          <AuthSplit onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} authToken={authToken} setAuthToken={setAuthToken} />
        )}
      </main>

      {/* CORE BOUTIQUE EDITORIAL FOOTER */}
      <footer className="bg-brand-charcoal text-white border-t border-brand-warm-gray/15 py-16 px-6 md:px-12 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold tracking-tight text-brand-sand">
              The Paws Store
            </h3>
            <p className="text-xs text-[#EAE5DB]/65 font-light leading-relaxed max-w-sm">
              We curate, design, and manufacture premium aesthetic accessories for dogs and cats, blending elite orthotic support with standard-setting modern design.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#EAE5DB] font-bold mb-4">
              Refined Collections
            </h4>
            <div className="space-y-2 text-xs font-mono text-[#EAE5DB]/65">
              <button onClick={() => handleNavigate("shop")} className="block hover:text-brand-sand transition-colors">Shop All Pieces</button>
              <button onClick={() => handleNavigate("shop")} className="block hover:text-brand-sand transition-colors">Bespoke Canine Beds</button>
              <button onClick={() => handleNavigate("shop")} className="block hover:text-brand-sand transition-colors">Stoneware Dinnerware</button>
              <button onClick={() => handleNavigate("shop")} className="block hover:text-brand-sand transition-colors">Sustainable Organics</button>
              <button onClick={() => handleNavigate("harmonizer")} className="block text-brand-sand font-semibold hover:underline transition-all">Feline Harmonizer</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#EAE5DB] font-bold mb-4">
              VIP Portal
            </h4>
            <div className="space-y-2 text-xs font-mono text-[#EAE5DB]/65">
              <button onClick={() => handleNavigate("customer-portal")} className="block hover:text-brand-sand transition-colors">Sarah's Dashboard</button>
              <button onClick={() => handleNavigate("admin")} className="block hover:text-brand-sand transition-colors">Admin Console</button>
              <button onClick={() => handleNavigate("auth")} className="block hover:text-brand-sand transition-colors">Boutique Register</button>
              <button onClick={() => alert("Bespoke concierge contact is simulated.")} className="block hover:text-[#FDFBF7] transition-colors">Concierge Care</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#EAE5DB] font-bold mb-4">
              Contact & Hours
            </h4>
            <div className="space-y-1 text-xs font-mono text-[#EAE5DB]/65">
              <p>Boutique Showroom: Seattle, WA</p>
              <p>Monday — Friday: 9 AM — 6 PM</p>
              <p>Client Concierge: support@thepawsstore.com</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-[#EAE5DB]/40">
          <span>© 2026 The Paws Store Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-[#FDFBF7] cursor-pointer">Security Code</span>
            <span>•</span>
            <span className="hover:text-[#FDFBF7] cursor-pointer">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-[#FDFBF7] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
