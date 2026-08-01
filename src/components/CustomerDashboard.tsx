/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { User, Award, ShoppingBag, Settings, Plus, ChevronRight, Edit2, Check, Sparkles, Heart, Truck, Eye, Gift, Calendar, Clock, Package, CheckCircle2, MapPin, Star, MessageSquare, PenTool, X, RefreshCw, Download, FileText, Bell } from "lucide-react";
import jsPDF from "jspdf";
import { Order, PetProfile, StockNotification, MOCK_PETS, MOCK_ORDERS } from "../types";
import OrderTracker from "./OrderTracker";
import { AnimatePresence, motion } from "motion/react";

// Helper function to generate PDF Invoice using jsPDF
export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF();

  // Header / Branding Banner
  doc.setFillColor(35, 39, 42); // Charcoal background
  doc.rect(0, 0, 210, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("PAWS & CLAWS BOUTIQUE", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 215, 205);
  doc.text("Curated Luxury Goods for Discerning Companions", 14, 26);
  doc.text("INVOICE & RECEIPT OF PURCHASE", 14, 32);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(230, 115, 80); // Terracotta accent
  doc.text("OFFICIAL RECEIPT", 150, 26);

  // Metadata Section
  let y = 48;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(`Order Reference: ${order.id}`, 14, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Transaction Date: ${order.date}`, 14, y + 6);
  doc.text(`Order Fulfillment Status: ${order.status}`, 14, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Billed To:", 135, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Sarah Jenkins", 135, y + 6);
  doc.text("sarah.j@example.com", 135, y + 12);
  doc.text("San Francisco, CA", 135, y + 18);

  // Divider Line
  y += 26;
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);

  // Table Header
  y += 6;
  doc.setFillColor(245, 242, 235); // Oatmeal brand color
  doc.rect(14, y, 182, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text("CURATED ITEM DESCRIPTION", 18, y + 6);
  doc.text("QTY", 130, y + 6);
  doc.text("UNIT PRICE", 148, y + 6);
  doc.text("TOTAL AMOUNT", 172, y + 6);

  // Table Rows
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  let calculatedSubtotal = 0;
  order.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    calculatedSubtotal += itemTotal;

    doc.text(item.name, 18, y);
    doc.text(item.quantity.toString(), 133, y);
    doc.text(`$${item.price.toFixed(2)}`, 148, y);
    doc.text(`$${itemTotal.toFixed(2)}`, 172, y);

    // subtle row line
    doc.setDrawColor(240, 238, 232);
    doc.line(14, y + 3, 196, y + 3);
    y += 9;
  });

  y += 4;
  // Summary Calculation Box
  doc.setDrawColor(220, 215, 205);
  doc.line(120, y, 196, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", 135, y);
  doc.text(`$${calculatedSubtotal.toFixed(2)}`, 172, y);

  y += 6;
  doc.text("White-Glove Shipping:", 135, y);
  doc.text("Complimentary", 172, y);

  y += 6;
  doc.text("Sales Tax / Import Duties:", 135, y);
  doc.text("Included", 172, y);

  y += 8;
  doc.setFillColor(245, 242, 235);
  doc.rect(130, y - 4, 66, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(200, 80, 50); // Terracotta
  doc.text("Grand Total:", 135, y + 2);
  doc.text(`$${order.total.toFixed(2)}`, 172, y + 2);

  // Footer Branding Note
  y += 28;
  doc.setDrawColor(220, 215, 205);
  doc.line(14, y, 196, y);

  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for choosing Paws & Claws Boutique for your companion's wellness and luxury goods.", 14, y);
  doc.text("For order inquiries, returns, or support: support@pawsandclaws.com | www.pawsandclaws.com", 14, y + 5);

  doc.save(`Invoice_${order.id}.pdf`);
};

interface CustomerDashboardProps {
  onNavigate: (tab: string, productId?: string) => void;
  onAddToCart: (product: any, size?: string, color?: any) => void;
  products: any[];
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  initialTab?: "dashboard" | "orders" | "wishlist" | "addresses" | "notifications";
  notifications?: StockNotification[];
  onRemoveNotification?: (id: string) => void;
}

export default function CustomerDashboard({
  onNavigate,
  onAddToCart,
  products,
  favorites,
  onToggleFavorite,
  initialTab,
  notifications = [],
  onRemoveNotification,
}: CustomerDashboardProps) {
  // Navigation within Sarah's Dashboard
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "wishlist" | "addresses" | "notifications">(
    initialTab || "dashboard"
  );

  // Wishlist filtering state
  const [wishlistCategoryFilter, setWishlistCategoryFilter] = useState<string>("All");

  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.includes(p.id));
  }, [products, favorites]);

  const wishlistCategories = ["All", "Beds", "Treats", "Bowls", "Collars & Leashes", "Toys", "Eco-Friendly"];

  const matchesWishlistCategory = (product: any, filter: string) => {
    if (filter === "All") return true;
    const f = filter.toLowerCase();
    const name = (product.name || "").toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const cat = (product.category || "").toLowerCase();
    const tags = (product.tags || []).map((t: string) => t.toLowerCase());

    if (f === "beds") {
      return name.includes("bed") || desc.includes("bed") || tags.includes("beds") || tags.includes("bed") || tags.includes("orthopedic");
    }
    if (f === "treats") {
      return name.includes("treat") || name.includes("chew") || name.includes("food") || desc.includes("treat") || desc.includes("chew") || tags.includes("treats") || tags.includes("food");
    }
    if (f === "bowls") {
      return name.includes("bowl") || name.includes("feeder") || name.includes("dish") || desc.includes("bowl") || tags.includes("bowls") || tags.includes("feeding");
    }
    if (f === "collars & leashes" || f === "collars") {
      return name.includes("collar") || name.includes("leash") || name.includes("harness") || desc.includes("collar") || tags.includes("collars") || tags.includes("leather");
    }
    if (f === "toys") {
      return name.includes("toy") || name.includes("scratcher") || name.includes("catnip") || desc.includes("toy") || tags.includes("toys") || tags.includes("play");
    }
    if (f === "eco-friendly") {
      return cat === "eco-friendly" || tags.includes("eco-friendly") || tags.includes("organic") || tags.includes("sustainable") || desc.includes("recycled") || desc.includes("organic");
    }

    return name.includes(f) || cat.includes(f) || tags.some((t: string) => t.includes(f));
  };

  const filteredFavoriteProducts = useMemo(() => {
    return favoriteProducts.filter((prod) => matchesWishlistCategory(prod, wishlistCategoryFilter));
  }, [favoriteProducts, wishlistCategoryFilter]);

  // Registration date & Boutique Anniversary state
  const [registrationDate, setRegistrationDate] = useState<string>("2024-05-15");
  const [giftClaimed, setGiftClaimed] = useState<boolean>(false);

  // Check if registration is > 1 year relative to local date July 17, 2026
  const isOneYearAnniversary = useMemo(() => {
    try {
      const reg = new Date(registrationDate);
      const referenceDate = new Date("2026-07-17");
      const diffTime = referenceDate.getTime() - reg.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 365;
    } catch {
      return false;
    }
  }, [registrationDate]);

  // Sync state when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [orders, setOrders] = useState<Order[]>(() => [
    {
      id: "ORD-99580",
      date: "July 15, 2026",
      status: "Processing",
      items: [
        { name: "Luxury Leather Collar (XS)", quantity: 1, price: 52.00 },
        { name: "Artisan Ceramic Bowl (Medium)", quantity: 1, price: 48.00 }
      ],
      total: 100.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGLE0WfsJTKcKM3uAcYZOt8_pWiknFKqKyhOG1BzKQrVXSRCXrIXWvPTzhk81af9mkG41KZpX8CW84FWFtAriaNhzXNJtGwhuDZQ2OX-wUJL91CQ6F5I2C1AOXULFyZ6H348mrRpOisn6cbuksTBbFA1dKQw3bAUjPszQWEeFXD6V6c0WlYVtdY4kaGPOetmUg7COirIy-MQR_hC8GxSVUFZFzvIuuYTSIDXOiamvSkvKQhvsO7w"
    },
    {
      id: "ORD-99510",
      date: "July 14, 2026",
      status: "In Transit",
      items: [
        { name: "Cloud Orthopedic Bed (Large)", quantity: 1, price: 189.00 }
      ],
      total: 189.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4UWo_Uczr26zGBcLplnJVb1FXC_4WkQFqZ14kLKIZT40izL8crtfjXOrrI9D-7Cna4_LG1rV9kUCvx4hq1WLTzlV3jcqKYvF7Gjxc-P5-_mJVwibRfxltrkZUmvcFVT1lre6xyAddiLsAgTm71AUDrHOGs2t4mj9-7wByWZggZznxdsE7e8q6kZOlqIOnXXIx2DTu-yqQ6phJSiB0DE9RCLJDLVhs2wPvFzp_vP_-ku74l99_7g"
    },
    ...MOCK_ORDERS
  ]);

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "All") return orders;
    if (orderStatusFilter === "Processing") return orders.filter((o) => o.status === "Processing");
    if (orderStatusFilter === "Shipped") return orders.filter((o) => (o.status as string) === "In Transit" || (o.status as string) === "Shipped");
    if (orderStatusFilter === "Delivered") return orders.filter((o) => o.status === "Delivered");
    return orders;
  }, [orders, orderStatusFilter]);

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const toggleTrackOrder = (orderId: string) => {
    setTrackingOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Customer Product Review State
  interface CustomerReview {
    id: string;
    orderId: string;
    itemName: string;
    rating: number;
    title: string;
    comment: string;
    petName: string;
    date: string;
  }

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem("paws_customer_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: "rev-101",
        orderId: "ORD-92841",
        itemName: "Minimalist Japanese Ceramic Bowl",
        rating: 5,
        title: "Sleek weight & ideal height!",
        comment: "Mochi loves eating out of this bowl! The weighted base prevents any sliding during mealtime, and the satin glaze looks gorgeous on our kitchen floor.",
        petName: "Mochi (Persian Cat)",
        date: "Jul 18, 2026",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("paws_customer_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewPetName, setReviewPetName] = useState<string>("Mochi (Persian)");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  const openReviewForm = (order: Order) => {
    if (activeReviewOrderId === order.id) {
      setActiveReviewOrderId(null);
      return;
    }
    setActiveReviewOrderId(order.id);
    const firstItem = order.items[0]?.name || "Purchased Product";
    setSelectedItemForReview(firstItem);

    const existing = reviews.find((r) => r.orderId === order.id && r.itemName === firstItem);
    if (existing) {
      setReviewRating(existing.rating);
      setReviewTitle(existing.title);
      setReviewComment(existing.comment);
      setReviewPetName(existing.petName || "Mochi (Persian)");
    } else {
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewPetName("Mochi (Persian)");
    }
    setReviewSuccessMsg(null);
  };

  const handleSelectReviewItem = (itemName: string, orderId: string) => {
    setSelectedItemForReview(itemName);
    const existing = reviews.find((r) => r.orderId === orderId && r.itemName === itemName);
    if (existing) {
      setReviewRating(existing.rating);
      setReviewTitle(existing.title);
      setReviewComment(existing.comment);
      setReviewPetName(existing.petName || "Mochi (Persian)");
    } else {
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewPetName("Mochi (Persian)");
    }
  };

  const handleSubmitReview = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!selectedItemForReview) return;
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      alert("Please enter a review headline and comment before submitting.");
      return;
    }

    const existingIdx = reviews.findIndex((r) => r.orderId === orderId && r.itemName === selectedItemForReview);
    const newReview: CustomerReview = {
      id: existingIdx >= 0 ? reviews[existingIdx].id : `rev-${Date.now()}`,
      orderId,
      itemName: selectedItemForReview,
      rating: reviewRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      petName: reviewPetName,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    if (existingIdx >= 0) {
      const updated = [...reviews];
      updated[existingIdx] = newReview;
      setReviews(updated);
    } else {
      setReviews([newReview, ...reviews]);
    }

    setReviewSuccessMsg("Your review has been submitted and published! Thank you for sharing your experience.");
    setTimeout(() => {
      setReviewSuccessMsg(null);
    }, 4000);
  };

  // Pet Profile switcher state
  const [pets, setPets] = useState<PetProfile[]>(MOCK_PETS);
  const [activePetId, setActivePetId] = useState<string>("max-dog");

  // Edit pet details modal/form state
  const [isEditingPet, setIsEditingPet] = useState<boolean>(false);
  const [editName, setEditName] = useState("");
  const [editBreed, setEditBreed] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editBio, setEditBio] = useState("");

  const currentPet = pets.find((p) => p.id === activePetId) || pets[0];

  const handleEditClick = () => {
    setEditName(currentPet.name);
    setEditBreed(currentPet.breed);
    setEditAge(currentPet.age);
    setEditWeight(currentPet.weight);
    setEditBio(currentPet.bio);
    setIsEditingPet(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    setPets(
      pets.map((p) =>
        p.id === activePetId
          ? {
              ...p,
              name: editName,
              breed: editBreed,
              age: editAge,
              weight: editWeight,
              bio: editBio,
            }
          : p
      )
    );
    setIsEditingPet(false);
  };

  const activeRecommendationProducts = products.filter((p) =>
    currentPet.recommendations.some((recName) => p.name.includes(recName.split(" (")[0]))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Welcome Banner */}
      <div className="bg-brand-charcoal text-white p-8 md:p-12 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          {/* Subtle design element */}
          <div className="w-96 h-96 rounded-full bg-brand-sand blur-3xl transform translate-x-20 translate-y-20"></div>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-sand" />
            <span className="text-xs font-mono tracking-widest text-brand-sand uppercase">
              VIP Companion Tier
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-light">
            Welcome back, <span className="font-semibold text-brand-sand">Sarah</span>
          </h1>
          <p className="text-sm text-brand-oatmeal/75 max-w-md font-light leading-relaxed">
            Your home and companions are in beautiful harmony. Explore personalized wellness curation for {currentPet.name} today.
          </p>
        </div>

        <div className="relative z-10 flex gap-4">
          <button
            onClick={() => onNavigate("shop")}
            className="px-6 py-3 bg-brand-sand text-brand-charcoal hover:bg-white transition-colors font-mono text-[11px] uppercase tracking-wider rounded-none font-semibold"
          >
            Curated Shop Catalog
          </button>
        </div>
      </div>

      {/* Boutique Anniversary Banner */}
      <AnimatePresence>
        {isOneYearAnniversary && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", y: 0, marginBottom: 40 }}
            exit={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#F9F6F0] via-[#FAF3EC] to-[#FAF6F0] border-l-4 border-brand-terracotta border-t border-r border-b border-brand-warm-gray/40 p-6 md:p-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 relative shadow-sm">
              <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-5 hidden md:block">
                <Gift className="w-40 h-40 text-brand-terracotta transform rotate-12" />
              </div>

              <div className="relative z-10 flex items-start gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-terracotta/10 border border-brand-terracotta/20 flex items-center justify-center text-brand-terracotta shrink-0 mt-1">
                  <Award className="w-6 h-6 md:w-7 md:h-7 animate-pulse" />
                </div>
                
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-brand-terracotta/10 border border-brand-terracotta/35 px-2.5 py-0.5 text-brand-terracotta font-bold">
                      Boutique Anniversary
                    </span>
                    <span className="text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-sand fill-brand-sand" /> Celebrated Patron
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-display font-medium text-brand-charcoal tracking-tight">
                    Congratulations on Your Patron Anniversary, Sarah!
                  </h2>
                  
                  <p className="text-xs md:text-sm text-brand-charcoal/70 leading-relaxed font-light">
                    Today marks <span className="font-semibold text-brand-charcoal">over a year</span> since you joined our elite companion circle. Your pursuit of refined pet spaces and conscious design is an inspiration. We are honored to accompany you on this exquisite path of wellness.
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 justify-center">
                {giftClaimed ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-brand-sage/10 border border-brand-sage px-5 py-4 text-center rounded-none font-mono text-[11px] text-brand-sage font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-brand-sage shrink-0" />
                    <span>ANNIVERSARY REWARD CLAIMED!</span>
                  </motion.div>
                ) : (
                  <>
                    <div className="border border-brand-warm-gray bg-white p-3.5 flex flex-col justify-center min-w-[180px] text-center">
                      <span className="text-[9px] font-mono text-brand-charcoal/40 uppercase tracking-wider block mb-1">Exclusive VIP Code</span>
                      <code className="text-xs font-mono font-bold text-brand-terracotta select-all tracking-wider">PATRON1YEAR</code>
                    </div>
                    <button
                      onClick={() => {
                        setGiftClaimed(true);
                        alert("Anniversary milestone claimed successfully! A luxurious complimentary 'Artisan Meadow Balm' has been added to your upcoming delivery curation box. Thank you for your continued loyalty.");
                      }}
                      className="px-6 py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-mono text-[11px] uppercase tracking-widest font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-terracotta/10 hover:shadow-brand-terracotta/20"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Claim Free Gift</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Secondary Navigation Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-brand-warm-gray/40 p-6 space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/40 pb-3 border-b border-brand-warm-gray/60 mb-3">
              Sarah's Account
            </h3>

            {/* Registration Date Configuration */}
            <div className="pb-3 text-[11px] font-mono text-brand-charcoal/70 border-b border-brand-warm-gray/40 mb-3 space-y-2">
              <div className="flex items-center gap-1.5 text-brand-charcoal/80">
                <Calendar className="w-3.5 h-3.5 text-brand-terracotta shrink-0" />
                <span>Patron Since:</span>
              </div>
              <div className="font-semibold text-brand-charcoal text-[11px] pl-5">
                {(() => {
                  try {
                    return new Date(registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  } catch {
                    return registrationDate;
                  }
                })()}
              </div>
              <div className="flex flex-col gap-1 pl-5 pt-1">
                <span className="text-[9px] text-brand-charcoal/40 uppercase tracking-widest">Adjust Registered Date:</span>
                <input 
                  type="date" 
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-warm-gray/60 px-1.5 py-1 text-[10px] font-mono focus:outline-none focus:border-brand-sage text-brand-charcoal rounded-none"
                />
              </div>
            </div>

            {[
              { id: "dashboard", label: "My Dashboard" },
              { id: "orders", label: "Purchase History" },
              { id: "wishlist", label: "My Favorites" },
              { id: "notifications", label: `Stock Alerts (${notifications.length})` },
              { id: "addresses", label: "Shipping Addresses" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsEditingPet(false);
                }}
                className={`w-full text-left py-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between rounded-none ${
                  activeTab === tab.id
                    ? "bg-brand-oatmeal text-brand-charcoal font-bold border-l-2 border-brand-terracotta"
                    : "text-brand-charcoal/70 hover:bg-brand-oatmeal/40 hover:text-brand-charcoal"
                }`}
              >
                <span>{tab.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </button>
            ))}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#FAF8F5] border border-brand-warm-gray p-6 space-y-5 relative shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-brand-terracotta font-bold">
                VIP UTILITIES
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-sage"></span>
              </span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-display font-semibold text-brand-charcoal tracking-tight">
                Quick Portal Actions
              </h4>
              <p className="text-[11px] text-brand-charcoal/50 leading-relaxed font-light">
                Secure immediate replenishment or manage your bespoke recurring orders below.
              </p>
            </div>

            <hr className="border-brand-warm-gray/40" />

            <div className="space-y-3">
              <button
                onClick={() => {
                  alert("Essentials reordered! Artisan Ceramic Bowl (Sage) and Treats Bundle added to cart.");
                  onAddToCart(products[1], "Medium", { name: "Sage Green", value: "#99A98F" });
                  onAddToCart(products[4]);
                }}
                className="w-full py-3 bg-brand-charcoal text-white hover:bg-brand-terracotta font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-300 rounded-none shadow-sm cursor-pointer hover:shadow-md"
              >
                Reorder Essentials
              </button>
              
              <button
                onClick={() => alert("Subscription details: 1x Organic Treats Monthly, arriving on 25th. Next cycle is active.")}
                className="w-full py-3 bg-transparent border border-brand-charcoal/60 text-brand-charcoal hover:bg-brand-charcoal hover:text-white font-mono text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 rounded-none cursor-pointer"
              >
                Manage Subscriptions
              </button>
            </div>

            <div className="bg-brand-cream/40 p-3 border border-brand-warm-gray/30">
              <p className="text-[10px] font-mono text-brand-charcoal/60 leading-relaxed flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-sand fill-brand-sand shrink-0" />
                <span>Next automated curation: <strong>July 25, 2026</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-9 space-y-8">
          {activeTab === "dashboard" && (
            <>
              {/* TOP METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Orders Metric Card */}
                <div className="bg-white border border-brand-warm-gray/40 p-6 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-brand-oatmeal flex items-center justify-center text-brand-terracotta">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/50 block">
                      Total Orders Secured
                    </span>
                    <span className="text-3xl font-mono font-bold text-brand-charcoal">
                      12
                    </span>
                  </div>
                </div>

                {/* Reward Points Metric Card */}
                <div className="bg-white border border-brand-warm-gray/40 p-6 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-brand-oatmeal flex items-center justify-center text-brand-sage">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/50 block">
                      Rewards Balance
                    </span>
                    <span className="text-3xl font-mono font-bold text-brand-charcoal flex items-baseline gap-1.5">
                      1,450 <span className="text-xs font-normal text-brand-charcoal/60">Points</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* PET PROFILE CONTROL SWITCHER & INFOCARD */}
              <div className="bg-white border border-brand-warm-gray/40 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-brand-warm-gray mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
                      Household Wellness Curation
                    </span>
                    <h2 className="text-xl font-display font-medium text-brand-charcoal">
                      Companion Profiles
                    </h2>
                  </div>

                  {/* Switcher Controls */}
                  <div className="flex gap-2.5">
                    {pets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePetId(p.id);
                          setIsEditingPet(false);
                        }}
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border rounded-none ${
                          activePetId === p.id
                            ? "bg-brand-charcoal text-white border-brand-charcoal font-bold"
                            : "border-brand-warm-gray text-brand-charcoal/80 hover:bg-brand-oatmeal"
                        }`}
                      >
                        {p.name} ({p.type === "dog" ? "Dog" : "Cat"})
                      </button>
                    ))}
                  </div>
                </div>

                {isEditingPet ? (
                  /* Edit Pet Form */
                  <form onSubmit={handleSavePet} className="space-y-4 font-mono text-xs max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-brand-charcoal/50 uppercase block mb-1">Companion Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-cream border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage text-brand-charcoal"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-brand-charcoal/50 uppercase block mb-1">Breed Type</label>
                        <input
                          type="text"
                          required
                          value={editBreed}
                          onChange={(e) => setEditBreed(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-cream border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage text-brand-charcoal"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-brand-charcoal/50 uppercase block mb-1">Age Span</label>
                        <input
                          type="text"
                          required
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-cream border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage text-brand-charcoal"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-brand-charcoal/50 uppercase block mb-1">Weight Value</label>
                        <input
                          type="text"
                          required
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="w-full px-3 py-2 bg-brand-cream border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage text-brand-charcoal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-charcoal/50 uppercase block mb-1">Curation Bio</label>
                      <textarea
                        rows={3}
                        required
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-cream border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage text-brand-charcoal resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-brand-sage text-white hover:bg-brand-sage-dark transition-colors uppercase tracking-wider text-[11px] font-bold"
                      >
                        Save Curation Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPet(false)}
                        className="px-5 py-2 bg-transparent border border-brand-warm-gray text-brand-charcoal hover:bg-brand-oatmeal transition-colors uppercase tracking-wider text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display Pet Card */
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-32 h-32 rounded-full border-2 border-brand-sand overflow-hidden shrink-0 shadow-inner bg-brand-oatmeal">
                      <img src={currentPet.image} alt={currentPet.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-4 flex-grow text-center md:text-left">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div>
                          <h3 className="text-2xl font-display font-medium text-brand-charcoal">
                            {currentPet.name}
                          </h3>
                          <span className="text-xs font-mono text-brand-charcoal/60">
                            {currentPet.breed} • {currentPet.age} • {currentPet.weight}
                          </span>
                        </div>

                        <button
                          onClick={handleEditClick}
                          className="px-3.5 py-1.5 border border-brand-warm-gray hover:border-brand-charcoal transition-all text-[10px] font-mono uppercase tracking-wider text-brand-charcoal flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Profile
                        </button>
                      </div>

                      <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">
                        {currentPet.bio}
                      </p>

                      {/* Dynamic recommendations based on switched pet */}
                      <div className="pt-4 border-t border-brand-warm-gray/60">
                        <span className="text-[10px] font-mono uppercase text-brand-terracotta tracking-wider font-semibold block mb-3">
                          Curator Picks For {currentPet.name}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeRecommendationProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => onNavigate("details", p.id)}
                              className="border border-brand-warm-gray/40 p-3 flex items-center gap-3 cursor-pointer hover:bg-brand-oatmeal/30 transition-all"
                            >
                              <div className="w-10 h-10 bg-brand-oatmeal overflow-hidden shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-display font-semibold text-brand-charcoal truncate">{p.name}</h4>
                                <span className="text-[10px] font-mono text-brand-charcoal/50">₹{p.price.toFixed(2)}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 ml-auto text-brand-charcoal/30" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RECENT ORDERS LIST TABLE */}
              <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-brand-warm-gray mb-6">
                  <h2 className="text-base font-display font-medium text-brand-charcoal">
                    Recent Curation Shipments
                  </h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-mono text-brand-terracotta border-b border-brand-terracotta/40 pb-0.5 hover:text-brand-terracotta-dark"
                  >
                    All Orders History
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-brand-warm-gray/40 hover:border-brand-charcoal/20 transition-all bg-white"
                    >
                      <div className="p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 font-mono text-xs">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-oatmeal overflow-hidden shrink-0 border border-brand-warm-gray/30">
                            <img src={ord.image} alt="Order item" className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-brand-charcoal">{ord.id}</span>
                            <span className="text-brand-charcoal/50 block">Placed on {ord.date}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 text-left md:text-center">
                          <span className="text-brand-charcoal/50 block">Recipients</span>
                          <span className="font-semibold text-brand-charcoal truncate max-w-xs block">
                            {ord.items.map((it) => `${it.name} (x${it.quantity})`).join(", ")}
                          </span>
                        </div>

                        <div className="text-left md:text-center space-y-1">
                          <span className="text-brand-charcoal/50 block">Status</span>
                          <div className="flex flex-col gap-1 items-start md:items-center">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold inline-block uppercase ${
                              ord.status === "Delivered"
                                ? "text-emerald-800 bg-emerald-50 border border-emerald-200/50"
                                : ord.status === "In Transit"
                                ? "text-blue-800 bg-blue-50 border border-blue-200/50"
                                : "text-amber-800 bg-amber-50 border border-amber-200/50"
                            }`}>
                              {ord.status}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                              (ord as any).paymentStatus === "PAID"
                                ? "bg-emerald-600 text-white"
                                : (ord as any).paymentStatus === "FAILED"
                                ? "bg-red-600 text-white"
                                : (ord as any).paymentStatus === "REFUNDED"
                                ? "bg-amber-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}>
                              {(ord as any).paymentStatus === "PAID"
                                ? "✅ Paid"
                                : (ord as any).paymentStatus === "FAILED"
                                ? "❌ Payment Failed"
                                : (ord as any).paymentStatus === "REFUNDED"
                                ? "🔄 Refunded"
                                : "💳 Awaiting Payment"}
                            </span>
                          </div>
                        </div>

                        <div className="text-left md:text-right space-y-2">
                          <span className="font-bold text-brand-charcoal block">₹{ord.total.toFixed(2)}</span>
                          <div className="flex flex-wrap md:justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => generateInvoicePDF(ord)}
                              className="px-3 py-1.5 bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray/60 transition-all text-[10px] uppercase tracking-wider font-semibold cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5 text-brand-terracotta" />
                              Download Invoice
                            </button>
                            <button
                              onClick={() => toggleTrackOrder(ord.id)}
                              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all ${
                                trackingOrderId === ord.id
                                  ? "bg-brand-terracotta text-white"
                                  : "bg-brand-oatmeal text-brand-charcoal hover:bg-brand-warm-gray/40"
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              {trackingOrderId === ord.id ? "Close" : "Track"}
                            </button>
                            <button
                              onClick={() => {
                                alert(`Reordering items for ${ord.id}! Added to cart.`);
                                ord.items.forEach((item) => {
                                  const foundProd = products.find((p) => p.name.includes(item.name.split(" (")[0]));
                                  if (foundProd) onAddToCart(foundProd);
                                });
                              }}
                              className="px-3 py-1.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-all text-[10px] uppercase tracking-wider font-semibold"
                            >
                              Reorder Box
                            </button>
                          </div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {trackingOrderId === ord.id && (
                          <OrderTracker order={ord} />
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm space-y-6">
              {/* Header & Subtitle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-warm-gray">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase font-bold">
                      Order History Telemetry
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-medium text-brand-charcoal mt-1">
                    Order History & Timeline Tracker
                  </h2>
                </div>
                <div className="text-xs font-mono text-brand-charcoal/60">
                  Total Orders: <strong className="text-brand-charcoal">{orders.length}</strong>
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-charcoal/60 font-semibold mr-1">
                  Status Filter:
                </span>
                {[
                  { id: "All", label: "All Orders", count: orders.length },
                  { id: "Processing", label: "Processing", count: orders.filter((o) => o.status === "Processing").length },
                  { id: "Shipped", label: "Shipped / In Transit", count: orders.filter((o) => (o.status as string) === "In Transit" || (o.status as string) === "Shipped").length },
                  { id: "Delivered", label: "Delivered", count: orders.filter((o) => o.status === "Delivered").length },
                ].map((st) => {
                  const isActive = orderStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border rounded-none cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? "bg-brand-charcoal text-white border-brand-charcoal font-bold shadow-xs"
                          : "bg-white text-brand-charcoal/80 border-brand-warm-gray hover:border-brand-charcoal hover:bg-brand-oatmeal/50"
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-mono rounded ${
                          isActive ? "bg-white/20 text-white font-bold" : "bg-brand-oatmeal text-brand-charcoal/60"
                        }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Orders Timeline List */}
              <div className="space-y-6">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const isProcessing = ord.status === "Processing";
                    const isInTransit = (ord.status as string) === "In Transit" || (ord.status as string) === "Shipped";
                    const isDelivered = ord.status === "Delivered";

                    return (
                      <div
                        key={ord.id}
                        className="border border-brand-warm-gray/60 hover:border-brand-charcoal/30 transition-all bg-white shadow-xs overflow-hidden"
                      >
                        {/* Order Header Summary */}
                        <div className="p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 font-mono text-xs border-b border-brand-warm-gray/30 bg-brand-cream/10">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand-oatmeal overflow-hidden shrink-0 border border-brand-warm-gray/40">
                              <img src={ord.image} alt="Order item" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-brand-charcoal">{ord.id}</span>
                                <span
                                  className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    isDelivered
                                      ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                                      : isInTransit
                                      ? "text-blue-800 bg-blue-50 border border-blue-200"
                                      : "text-amber-800 bg-amber-50 border border-amber-200"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>
                              <span className="text-brand-charcoal/50 block text-[11px]">Placed on {ord.date}</span>
                            </div>
                          </div>

                          <div className="space-y-0.5 text-left md:text-center">
                            <span className="text-brand-charcoal/50 block text-[10px] uppercase font-semibold">Items Curation</span>
                            <span className="font-semibold text-brand-charcoal truncate max-w-xs block text-[11px]">
                              {ord.items.map((it) => `${it.name} (x${it.quantity})`).join(", ")}
                            </span>
                          </div>

                          <div className="text-left md:text-right space-y-2">
                            <span className="font-bold text-sm text-brand-charcoal block">₹{ord.total.toFixed(2)}</span>
                            <div className="flex flex-wrap md:justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => generateInvoicePDF(ord)}
                                className="px-3 py-1.5 bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray/60 transition-all text-[10px] uppercase tracking-wider font-semibold cursor-pointer flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-brand-terracotta" />
                                Download Invoice
                              </button>
                              <button
                                type="button"
                                onClick={() => openReviewForm(ord)}
                                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  activeReviewOrderId === ord.id
                                    ? "bg-amber-600 text-white"
                                    : "bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray/60"
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${activeReviewOrderId === ord.id ? "fill-white text-white" : "fill-amber-400 text-amber-500"}`} />
                                {activeReviewOrderId === ord.id ? "Close Review Form" : "Write a Review"}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTrackOrder(ord.id)}
                                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  trackingOrderId === ord.id
                                    ? "bg-brand-terracotta text-white"
                                    : "bg-brand-charcoal text-white hover:bg-brand-sage"
                                }`}
                              >
                                <Truck className="w-3.5 h-3.5" />
                                {trackingOrderId === ord.id ? "Hide Detailed Map" : "Track Live Courier"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Re-adding components of ${ord.id} to cart!`);
                                  ord.items.forEach((item) => {
                                    const foundProd = products.find((p) => p.name.includes(item.name.split(" (")[0]));
                                    if (foundProd) onAddToCart(foundProd);
                                  });
                                }}
                                className="px-3 py-1.5 bg-brand-oatmeal text-brand-charcoal hover:bg-brand-warm-gray/50 border border-brand-warm-gray/60 transition-all text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
                              >
                                Reorder Box
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order History Visual Timeline Tracker Bar */}
                        <div className="px-5 py-4 bg-white border-b border-brand-warm-gray/30 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-mono text-brand-charcoal/70">
                            <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5 text-brand-charcoal">
                              <Clock className="w-3.5 h-3.5 text-brand-terracotta" /> Order Status Timeline:
                            </span>
                            <span className="text-[10px] text-brand-charcoal/50">
                              Updated 2 mins ago
                            </span>
                          </div>

                          {/* 3-Step Timeline Track */}
                          <div className="grid grid-cols-3 gap-2 relative items-start pt-1">
                            {/* Connecting background bar */}
                            <div className="absolute top-[18px] left-[16%] right-[16%] h-1 bg-brand-warm-gray/30 -z-0" />
                            {/* Connecting active progress bar */}
                            <div
                              className="absolute top-[18px] left-[16%] h-1 bg-emerald-600 transition-all duration-500 -z-0"
                              style={{
                                width: isDelivered ? "68%" : isInTransit ? "34%" : "0%",
                              }}
                            />

                            {/* Step 1: Processing */}
                            <div className="flex flex-col items-center text-center z-10 space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all ${
                                  isDelivered || isInTransit
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 animate-pulse"
                                }`}
                              >
                                {isDelivered || isInTransit ? <Check className="w-4 h-4 stroke-[3]" /> : <Package className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                                isProcessing ? "text-amber-700" : "text-brand-charcoal"
                              }`}>
                                Processing
                              </span>
                              <span className="text-[9px] font-mono text-brand-charcoal/50 hidden sm:block">
                                Curation & Quality Check
                              </span>
                            </div>

                            {/* Step 2: Shipped / In Transit */}
                            <div className="flex flex-col items-center text-center z-10 space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all ${
                                  isDelivered
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : isInTransit
                                    ? "bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 animate-pulse"
                                    : "bg-white text-brand-charcoal/30 border-brand-warm-gray"
                                }`}
                              >
                                {isDelivered ? <Check className="w-4 h-4 stroke-[3]" /> : <Truck className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                                isInTransit ? "text-blue-700" : isDelivered ? "text-brand-charcoal" : "text-brand-charcoal/40"
                              }`}>
                                Shipped
                              </span>
                              <span className="text-[9px] font-mono text-brand-charcoal/50 hidden sm:block">
                                En Route Carrier Transit
                              </span>
                            </div>

                            {/* Step 3: Delivered */}
                            <div className="flex flex-col items-center text-center z-10 space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all ${
                                  isDelivered
                                    ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100"
                                    : "bg-white text-brand-charcoal/30 border-brand-warm-gray"
                                }`}
                              >
                                {isDelivered ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : <MapPin className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                                isDelivered ? "text-emerald-700" : "text-brand-charcoal/40"
                              }`}>
                                Delivered
                              </span>
                              <span className="text-[9px] font-mono text-brand-charcoal/50 hidden sm:block">
                                White-Glove Handover
                              </span>
                            </div>
                          </div>

                          {/* Status Description Callout */}
                          <div className="mt-2 p-2.5 bg-brand-oatmeal/40 border border-brand-warm-gray/30 text-[11px] font-mono text-brand-charcoal/80 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
                              <strong>Current Status Note:</strong>{" "}
                              {isProcessing && "Companion order approved and undergoing hand-wrapped eco packaging in Seattle Hub A."}
                              {isInTransit && "Parcel departed FedEx Kent Transit Hub WA; climate courier en route on schedule."}
                              {isDelivered && `Hand-delivered and verified on ${ord.date} into companion entry locker.`}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleTrackOrder(ord.id)}
                              className="text-[10px] uppercase font-bold text-brand-terracotta hover:underline ml-2 shrink-0 cursor-pointer"
                            >
                              {trackingOrderId === ord.id ? "Hide Map" : "View Map"}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Live Courier Telemetry Component */}
                        <AnimatePresence>
                          {trackingOrderId === ord.id && (
                            <OrderTracker order={ord} />
                          )}
                        </AnimatePresence>

                        {/* Interactive Customer Review Form */}
                        <AnimatePresence>
                          {activeReviewOrderId === ord.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-5 bg-brand-cream/40 border-t border-brand-warm-gray/40 space-y-4 font-mono text-xs"
                            >
                              <div className="flex items-center justify-between pb-3 border-b border-brand-warm-gray/30">
                                <div className="flex items-center gap-2">
                                  <PenTool className="w-4 h-4 text-brand-terracotta" />
                                  <h3 className="text-sm font-display font-semibold text-brand-charcoal">
                                    Submit Verified Product Review
                                  </h3>
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase rounded-none">
                                    Verified Buyer ({ord.id})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveReviewOrderId(null)}
                                  className="text-brand-charcoal/50 hover:text-brand-charcoal cursor-pointer p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {reviewSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{reviewSuccessMsg}</span>
                                </div>
                              )}

                              {/* Item Selector if multiple items */}
                              {ord.items.length > 1 && (
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/70 block">
                                    Select Purchased Item to Review:
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {ord.items.map((item) => {
                                      const isSelected = selectedItemForReview === item.name;
                                      const hasRev = reviews.some((r) => r.orderId === ord.id && r.itemName === item.name);
                                      return (
                                        <button
                                          key={item.name}
                                          type="button"
                                          onClick={() => handleSelectReviewItem(item.name, ord.id)}
                                          className={`px-3 py-1.5 text-xs font-mono transition-all border text-left cursor-pointer flex items-center gap-2 ${
                                            isSelected
                                              ? "bg-brand-charcoal text-white border-brand-charcoal font-semibold"
                                              : "bg-white text-brand-charcoal border-brand-warm-gray hover:border-brand-charcoal"
                                          }`}
                                        >
                                          <span>{item.name}</span>
                                          {hasRev && <Star className="w-3 h-3 fill-amber-400 text-amber-500" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <form onSubmit={(e) => handleSubmitReview(e, ord.id)} className="space-y-4">
                                {/* Rating Stars */}
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/70 block">
                                    Overall Rating for <strong className="text-brand-charcoal">{selectedItemForReview}</strong>:
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const activeVal = reviewHoverRating || reviewRating;
                                      return (
                                        <button
                                          key={star}
                                          type="button"
                                          onMouseEnter={() => setReviewHoverRating(star)}
                                          onMouseLeave={() => setReviewHoverRating(0)}
                                          onClick={() => setReviewRating(star)}
                                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                        >
                                          <Star
                                            className={`w-6 h-6 ${
                                              star <= activeVal
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-brand-warm-gray/60 fill-none"
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                    <span className="text-xs font-mono font-semibold text-brand-charcoal/80 ml-2">
                                      {reviewHoverRating || reviewRating} / 5 Stars{" "}
                                      <span className="text-brand-charcoal/50 text-[10px]">
                                        ({(reviewHoverRating || reviewRating) === 5
                                          ? "Loved by Companion!"
                                          : (reviewHoverRating || reviewRating) === 4
                                          ? "Very Good"
                                          : (reviewHoverRating || reviewRating) === 3
                                          ? "Good"
                                          : (reviewHoverRating || reviewRating) === 2
                                          ? "Fair"
                                          : "Needs Improvement"})
                                      </span>
                                    </span>
                                  </div>
                                </div>

                                {/* Pet Tag and Review Headline */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/70 block mb-1">
                                      Companion Pet Profile Tag:
                                    </label>
                                    <select
                                      value={reviewPetName}
                                      onChange={(e) => setReviewPetName(e.target.value)}
                                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-brand-warm-gray text-brand-charcoal focus:border-brand-charcoal focus:outline-none"
                                    >
                                      <option value="Mochi (Persian Cat)">Mochi (Persian Cat)</option>
                                      <option value="Luna (Ragdoll Cat)">Luna (Ragdoll Cat)</option>
                                      <option value="Household Pet Family">Household Pet Family</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/70 block mb-1">
                                      Review Headline:
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Exceptional craftsmanship, Mochi loves this!"
                                      value={reviewTitle}
                                      onChange={(e) => setReviewTitle(e.target.value)}
                                      className="w-full px-3 py-2 text-xs font-sans bg-white border border-brand-warm-gray text-brand-charcoal focus:border-brand-charcoal focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Review Text Comment */}
                                <div>
                                  <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/70 block mb-1">
                                    Written Comment / Feedback:
                                  </label>
                                  <textarea
                                    required
                                    rows={3}
                                    placeholder="Write a detailed comment about comfort, material durability, aesthetic fit, or your pet's reaction..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-sans bg-white border border-brand-warm-gray text-brand-charcoal focus:border-brand-charcoal focus:outline-none"
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setActiveReviewOrderId(null)}
                                    className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 hover:text-brand-charcoal border border-transparent hover:border-brand-warm-gray cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-brand-charcoal text-white hover:bg-brand-sage transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>Submit Review</span>
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Existing Submitted Reviews Preview for this Order */}
                        {reviews.filter((r) => r.orderId === ord.id).length > 0 && (
                          <div className="px-5 py-3.5 bg-brand-oatmeal/20 border-t border-brand-warm-gray/30 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-brand-charcoal/70">
                              <span className="uppercase tracking-wider font-bold flex items-center gap-1.5 text-brand-charcoal">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                                Published Reviews ({reviews.filter((r) => r.orderId === ord.id).length})
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase">
                                Verified Purchase Feedback
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {reviews
                                .filter((r) => r.orderId === ord.id)
                                .map((rev) => (
                                  <div
                                    key={rev.id}
                                    className="p-3.5 bg-white border border-brand-warm-gray/50 font-mono text-xs space-y-2 shadow-2xs relative"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-brand-charcoal truncate text-[11px]">
                                        {rev.itemName}
                                      </span>
                                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                                        {[...Array(5)].map((_, idx) => (
                                          <Star
                                            key={idx}
                                            className={`w-3 h-3 ${
                                              idx < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-none"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="font-sans font-bold text-brand-charcoal text-xs">
                                      "{rev.title}"
                                    </p>
                                    <p className="font-sans text-brand-charcoal/80 text-[11px] leading-relaxed">
                                      {rev.comment}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 text-[10px] text-brand-charcoal/60 border-t border-brand-warm-gray/20">
                                      <span className="font-semibold text-brand-terracotta">Tag: {rev.petName}</span>
                                      <span>{rev.date}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-brand-warm-gray bg-brand-cream/10">
                    <Package className="w-8 h-8 text-brand-charcoal/20 mx-auto mb-3" />
                    <p className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/60 mb-3">
                      No orders found under status: <strong className="text-brand-charcoal">{orderStatusFilter}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter("All")}
                      className="px-4 py-2 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
                    >
                      Show All Orders ({orders.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-brand-warm-gray mb-6">
                <h2 className="text-lg font-display font-medium text-brand-charcoal">
                  My Favorites
                </h2>
                <span className="text-xs font-mono text-brand-charcoal/50">
                  {favoriteProducts.length} Refined Item(s)
                </span>
              </div>

              {/* Category Filter Buttons */}
              {favoriteProducts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-brand-warm-gray/40">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-charcoal/60 mr-1 font-semibold">
                    Filter Category:
                  </span>
                  {wishlistCategories.map((cat) => {
                    const count = favoriteProducts.filter((p) => matchesWishlistCategory(p, cat)).length;
                    const isActive = wishlistCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setWishlistCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border rounded-none cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? "bg-brand-charcoal text-white border-brand-charcoal font-bold shadow-xs"
                            : "bg-white text-brand-charcoal/80 border-brand-warm-gray hover:border-brand-charcoal hover:bg-brand-oatmeal/50"
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-mono rounded ${
                            isActive
                              ? "bg-white/20 text-white font-bold"
                              : "bg-brand-oatmeal text-brand-charcoal/60"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {favoriteProducts.length > 0 ? (
                filteredFavoriteProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFavoriteProducts.map((prod: any) => (
                      <div key={prod.id} className="border border-brand-warm-gray/40 p-4 flex gap-4 hover:shadow-md transition-all bg-white relative group">
                        <div className="w-20 h-20 bg-brand-oatmeal overflow-hidden shrink-0 cursor-pointer" onClick={() => onNavigate("details", prod.id)}>
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-display font-bold text-brand-charcoal truncate hover:text-brand-terracotta cursor-pointer" onClick={() => onNavigate("details", prod.id)}>
                                {prod.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-brand-charcoal/50 uppercase tracking-wider">{prod.brand}</span>
                              <span className="text-[9px] font-mono bg-brand-oatmeal px-1.5 py-0.2 border border-brand-warm-gray/30 text-brand-charcoal/70 uppercase">
                                {prod.category}
                              </span>
                            </div>
                            <p className="font-mono text-xs text-brand-charcoal font-semibold mt-1">₹{prod.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                onAddToCart(prod);
                                alert(`${prod.name} added to cart from your favorites list.`);
                              }}
                              className="text-[10px] font-mono uppercase text-brand-terracotta hover:text-brand-terracotta-dark font-bold transition-colors cursor-pointer"
                            >
                              Add To Active Cart
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleFavorite(prod.id)}
                          className="text-brand-charcoal/30 hover:text-brand-terracotta text-sm font-mono p-1 transition-colors self-start ml-2 cursor-pointer"
                          title="Remove from favorites"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-brand-warm-gray bg-brand-cream/10">
                    <p className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/60 mb-3">
                      No saved items match the filter: <strong className="text-brand-charcoal">{wishlistCategoryFilter}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setWishlistCategoryFilter("All")}
                      className="px-4 py-2 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
                    >
                      Show All Favorites ({favoriteProducts.length})
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-12 border border-dashed border-brand-warm-gray bg-brand-cream/10">
                  <Heart className="w-8 h-8 text-brand-charcoal/20 mx-auto mb-3" />
                  <p className="text-sm text-brand-charcoal/50 font-light mb-4">Your curation list of favorites is currently empty.</p>
                  <button
                    onClick={() => onNavigate("shop")}
                    className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors text-xs font-mono uppercase tracking-wider"
                  >
                    Discover Refined Pieces
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 shadow-sm">
              <h2 className="text-lg font-display font-medium text-brand-charcoal pb-4 border-b border-brand-warm-gray mb-6">
                Saved Shipping Destinies
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="border border-brand-charcoal p-5 relative bg-brand-oatmeal/35">
                  <span className="absolute top-4 right-4 text-[9px] font-bold text-brand-sage uppercase bg-emerald-50 px-2 py-0.5 border border-brand-sage/35">
                    Primary Default
                  </span>
                  <h3 className="font-bold text-sm text-brand-charcoal mb-3">Sarah Jenkins (Home)</h3>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    1204 Pine Street<br />
                    Apt 4B<br />
                    Seattle, WA 98101<br />
                    United States
                  </p>
                  <button className="text-[10px] uppercase text-brand-terracotta font-bold mt-4 hover:underline">
                    Edit Address
                  </button>
                </div>

                <div className="border border-brand-warm-gray/50 p-5 hover:border-brand-charcoal transition-colors">
                  <h3 className="font-bold text-sm text-brand-charcoal mb-3">Sarah Jenkins (Office)</h3>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    750 Westlake Ave N<br />
                    Suite 900<br />
                    Seattle, WA 98109<br />
                    United States
                  </p>
                  <button className="text-[10px] uppercase text-brand-terracotta font-bold mt-4 hover:underline">
                    Edit Address
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white border border-brand-warm-gray/40 p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-warm-gray/40">
                <div>
                  <div className="flex items-center gap-2 text-brand-terracotta text-[10px] font-mono uppercase tracking-widest font-bold mb-1">
                    <Bell className="w-4 h-4" />
                    <span>Restock Watchlist</span>
                  </div>
                  <h2 className="text-2xl font-display font-medium text-brand-charcoal">
                    Saved Back-In-Stock Alerts
                  </h2>
                </div>
                <span className="text-xs font-mono text-brand-charcoal/60 bg-brand-cream/80 px-3 py-1.5 border border-brand-warm-gray/50">
                  {notifications.length} Active {notifications.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>

              <p className="text-xs font-sans text-brand-charcoal/70 leading-relaxed">
                You will receive automated priority email notifications at your registered address whenever any of these out-of-stock items are replenished.
              </p>

              {notifications.length > 0 ? (
                <div className="divide-y divide-brand-warm-gray/30 border border-brand-warm-gray/40">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-brand-oatmeal/20 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={notif.productImage}
                          alt={notif.productName}
                          className="w-16 h-16 object-cover border border-brand-warm-gray shrink-0"
                        />
                        <div className="truncate">
                          <h3 className="font-display font-medium text-base text-brand-charcoal truncate">
                            {notif.productName}
                          </h3>
                          <div className="flex items-center gap-3 text-xs font-mono text-brand-charcoal/60 mt-1">
                            <span className="font-bold text-brand-charcoal">${notif.productPrice.toFixed(2)}</span>
                            <span>•</span>
                            <span>Alert To: <strong className="text-brand-charcoal">{notif.email}</strong></span>
                          </div>
                          <div className="text-[10px] font-mono text-brand-charcoal/40 mt-1">
                            Requested on: {notif.createdAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-warm-gray/20">
                        <button
                          type="button"
                          onClick={() => onNavigate("product-details", notif.productId)}
                          className="px-3.5 py-2 bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-terracotta" />
                          View Product
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveNotification?.(notif.id)}
                          className="px-3.5 py-2 bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5 text-red-600" />
                          Cancel Alert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-brand-cream/30 border border-brand-warm-gray/30 space-y-3">
                  <Bell className="w-8 h-8 text-brand-charcoal/30 mx-auto" />
                  <h3 className="font-display font-medium text-base text-brand-charcoal">
                    No Active Back-In-Stock Alerts
                  </h3>
                  <p className="text-xs text-brand-charcoal/60 max-w-sm mx-auto leading-relaxed">
                    When an item is out of stock in our boutique, click 'Notify Me When Available' on the product page to receive automated stock updates here.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("shop")}
                    className="mt-2 px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-terracotta font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    Explore Catalog
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
