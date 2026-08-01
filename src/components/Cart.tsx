/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Percent, Gift, Building, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";
import ConfirmationModal from "./ConfirmationModal";

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigate: (tab: string, productId?: string) => void;
  onApplyDiscount: (code: string, pct: number) => void;
  discount: { code: string; percent: number };
}

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onNavigate, onApplyDiscount, discount }: CartProps) {
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccess, setPromoSuccess] = useState<string>("");

  // Item removal confirmation state
  const [itemPendingRemoval, setItemPendingRemoval] = useState<CartItem | null>(null);

  // Subtotal calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (discount.percent / 100);
  const taxedSubtotal = subtotal - discountAmount;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const estimatedTax = taxedSubtotal * 0.08; // 8% tax rate
  const orderTotal = taxedSubtotal + shipping + estimatedTax;

  // Multi-Vendor Store Grouping
  const storeGroups = useMemo(() => {
    const map = new Map<string, { storeId: string; storeName: string; items: CartItem[]; hasStockError: boolean }>();

    cartItems.forEach((item) => {
      const sId = item.storeId || "store-active-1";
      const sName = item.storeName || item.product.brand || "Bark & Purr Haven";
      const isOutOfStock = item.stockQuantity !== undefined ? item.stockQuantity < item.quantity : item.product.inStock === false;

      if (!map.has(sId)) {
        map.set(sId, {
          storeId: sId,
          storeName: sName,
          items: [],
          hasStockError: false
        });
      }

      const group = map.get(sId)!;
      group.items.push(item);
      if (isOutOfStock) {
        group.hasStockError = true;
      }
    });

    return Array.from(map.values());
  }, [cartItems]);

  const hasAnyStockError = storeGroups.some(g => g.hasStockError);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoCode.trim().toUpperCase();
    if (code === "ELEVATE10") {
      onApplyDiscount("ELEVATE10", 10);
      setPromoSuccess("Promo code ELEVATE10 (10% Off) applied successfully!");
    } else if (code === "SARAH") {
      onApplyDiscount("SARAH", 15);
      setPromoSuccess("Sarah's special founder discount (15% Off) applied!");
    } else {
      setPromoError("Invalid promo code. Try 'ELEVATE10' or 'SARAH'.");
    }
    setPromoCode("");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-warm-gray pb-6 mb-10">
        <div>
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
            Shopping Bag
          </span>
          <h1 className="text-3xl font-display font-medium text-brand-charcoal">
            Your <span className="font-semibold">Curated Cart</span>
          </h1>
        </div>
        <button
          onClick={() => onNavigate("shop")}
          className="text-xs font-mono text-brand-charcoal/60 hover:text-brand-charcoal transition-colors flex items-center gap-2 uppercase tracking-wider font-semibold border-b border-brand-charcoal/30 hover:border-brand-charcoal"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Browsing Items
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 border border-brand-warm-gray bg-white p-8">
          <ShoppingBag className="w-16 h-16 text-brand-charcoal/20 mx-auto mb-6" />
          <h2 className="text-xl font-display font-medium text-brand-charcoal mb-2">
            Your shopping cart is empty
          </h2>
          <p className="text-sm text-brand-charcoal/60 font-light max-w-sm mx-auto mb-8">
            Add elegant beds, handcrafted leashes, or organic snacks to get started on your curated journey.
          </p>
          <button
            onClick={() => onNavigate("shop")}
            className="px-8 py-3 bg-brand-charcoal text-white hover:bg-brand-sage text-xs font-mono uppercase tracking-widest transition-colors rounded-none"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Side: Store-Grouped Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            {storeGroups.map((group) => (
              <div key={group.storeId} className="border border-brand-warm-gray bg-white p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-warm-gray/60 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-terracotta" />
                    <h2 className="text-sm font-display font-bold text-brand-charcoal uppercase tracking-wider">
                      {group.storeName}
                    </h2>
                    <span className="text-[10px] font-mono bg-brand-sand/30 text-brand-charcoal/70 px-2 py-0.5 uppercase">
                      Boutique Partner
                    </span>
                  </div>
                  {group.hasStockError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-mono font-bold bg-red-50 px-2.5 py-1 border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Out of stock at {group.storeName}</span>
                    </div>
                  )}
                </div>

                <div className="hidden md:grid grid-cols-12 text-xs font-mono uppercase tracking-wider text-brand-charcoal/50 pb-2 border-b border-brand-warm-gray/30">
                  <span className="col-span-6">Curated Item Details</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                <div>
                  <AnimatePresence initial={false}>
                    {group.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0, y: 15 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ 
                          opacity: 0,
                          height: 0,
                          y: -15,
                          transition: {
                            opacity: { duration: 0.2 },
                            height: { duration: 0.25, delay: 0.05 },
                            y: { duration: 0.2 }
                          }
                        }}
                        style={{ overflow: "hidden" }}
                        className="grid grid-cols-1 md:grid-cols-12 items-center py-5 gap-4 md:gap-0 border-b border-brand-warm-gray/30 last:border-b-0"
                      >
                        {/* Photo & custom selections */}
                        <div className="col-span-1 md:col-span-6 flex gap-4">
                          <div className="w-20 h-20 bg-brand-oatmeal overflow-hidden border border-brand-warm-gray/40 shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-wider block">
                              {item.product.brand}
                            </span>
                            <h3
                              onClick={() => onNavigate("details", item.product.id)}
                              className="text-sm font-display font-semibold text-brand-charcoal hover:text-brand-terracotta cursor-pointer transition-colors"
                            >
                              {item.product.name}
                            </h3>

                            {/* Display custom size & color options */}
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-brand-charcoal/60">
                              {item.selectedSize && (
                                <span>
                                  Size: <strong className="text-brand-charcoal font-semibold">{item.selectedSize}</strong>
                                </span>
                              )}
                              {item.selectedColor.name && (
                                <span className="flex items-center gap-1.5">
                                  Color:
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-brand-warm-gray shadow-sm"
                                    style={{ backgroundColor: item.selectedColor.value }}
                                  ></span>
                                  <strong className="text-brand-charcoal font-semibold">{item.selectedColor.name}</strong>
                                </span>
                              )}
                            </div>

                            {item.giftNote && (
                              <div className="mt-2 flex items-start gap-1.5 bg-brand-terracotta/5 px-2.5 py-1.5 border-l-2 border-brand-terracotta/70 rounded-none max-w-md">
                                <Gift className="w-3.5 h-3.5 text-brand-terracotta shrink-0 mt-0.5" />
                                <p className="text-[11px] font-mono leading-relaxed text-brand-charcoal">
                                  Gift Note: <strong className="text-brand-charcoal/90 font-semibold italic">"{item.giftNote}"</strong>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-1 md:col-span-2 text-left md:text-center font-mono text-sm text-brand-charcoal">
                          <span className="inline md:hidden text-xs text-brand-charcoal/50">Unit Price: </span>
                          ₹{item.product.price.toFixed(2)}
                        </div>

                        {/* Interactive Quantity Counters */}
                        <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                          <div className="flex items-center border border-brand-warm-gray bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1 text-brand-charcoal/50 hover:bg-brand-oatmeal hover:text-brand-charcoal transition-all"
                            >
                              -
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.25, backgroundColor: "rgba(191, 91, 64, 0.15)", color: "#BF5B40" }}
                              animate={{ scale: 1, backgroundColor: "rgba(255, 255, 255, 0)", color: "#1C1C1A" }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className="w-8 text-center text-xs font-mono font-semibold py-1 px-0.5 inline-block"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-brand-charcoal/50 hover:bg-brand-oatmeal hover:text-brand-charcoal transition-all"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setItemPendingRemoval(item)}
                            className="ml-4 p-2 text-brand-charcoal/40 hover:text-brand-terracotta hover:bg-red-50 transition-all cursor-pointer"
                            title="Remove from Cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-1 md:col-span-2 text-right font-mono text-sm text-brand-charcoal font-semibold">
                          <span className="inline md:hidden text-xs text-brand-charcoal/50">Line Total: </span>
                          <motion.span
                            key={item.quantity}
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="inline-block"
                          >
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="pt-3 border-t border-brand-warm-gray/30 flex justify-between items-center font-mono text-xs text-brand-charcoal">
                  <span className="text-brand-charcoal/60 uppercase">Store Subtotal ({group.items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-bold text-sm">₹{group.items.reduce((a, b) => a + b.product.price * b.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Cost Summary Sidebar */}
          <div className="bg-brand-oatmeal p-8 border border-brand-warm-gray/50 space-y-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-semibold pb-4 border-b border-brand-warm-gray">
              Order Calculations
            </h2>

            {/* Price lines */}
            <div className="space-y-3.5 text-sm font-mono">
              <div className="flex justify-between text-brand-charcoal/70">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {discount.percent > 0 && (
                <div className="flex justify-between text-brand-sage font-medium">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> Discount ({discount.code})
                  </span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-charcoal/70">
                <span>Vetted Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : `₹${shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-brand-charcoal/70">
                <span>Estimated Taxes</span>
                <span>₹{estimatedTax.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-[10px] text-brand-charcoal/40 leading-tight">
                  *Add ₹{(150 - subtotal).toFixed(2)} more to qualify for complimentary shipping.
                </p>
              )}

              <div className="border-t border-brand-warm-gray pt-4 flex justify-between text-base text-brand-charcoal font-bold">
                <span>Grand Total</span>
                <span>₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount Form */}
            <form onSubmit={handleApplyPromo} className="pt-4 border-t border-brand-warm-gray/60 space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 block">
                Promo or Invitation Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. ELEVATE10"
                  className="flex-grow px-3 py-2 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage uppercase font-mono rounded-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors font-mono text-[10px] uppercase tracking-wider rounded-none shrink-0"
                >
                  Apply
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] font-mono text-brand-terracotta leading-tight">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[11px] font-mono text-brand-sage leading-tight flex items-center gap-1">
                  <Tag className="w-3 h-3 text-brand-sage inline" /> {promoSuccess}
                </p>
              )}
              {discount.percent === 0 && (
                <p className="text-[10px] font-mono text-brand-charcoal/40 leading-relaxed">
                  Tip: Apply code <span className="font-semibold text-brand-terracotta">ELEVATE10</span> (10% Off) or <span className="font-semibold text-brand-terracotta">SARAH</span> (15% Off).
                </p>
              )}
            </form>

            {/* Final CTA checkout button */}
            <button
              onClick={() => onNavigate("checkout")}
              disabled={hasAnyStockError}
              className="w-full py-4 bg-brand-charcoal text-white hover:bg-brand-sage text-xs font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-2 group transition-all duration-300 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasAnyStockError ? "Resolve Out-of-Stock Items First" : "Proceed to Secure Checkout"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* Item Removal Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={!!itemPendingRemoval}
        title="Remove Item from Shopping Bag?"
        message="Are you sure you want to remove this curated item from your bag? You can always add it back later from the catalog."
        confirmText="Remove Item"
        cancelText="Keep Item"
        variant="danger"
        itemDetails={
          itemPendingRemoval
            ? {
                name: itemPendingRemoval.product.name,
                image: itemPendingRemoval.product.image,
                meta: `Size: ${itemPendingRemoval.selectedSize} • Color: ${itemPendingRemoval.selectedColor.name} • Qty: ${itemPendingRemoval.quantity}`,
              }
            : undefined
        }
        onCancel={() => setItemPendingRemoval(null)}
        onConfirm={() => {
          if (itemPendingRemoval) {
            onRemoveItem(itemPendingRemoval.id);
            setItemPendingRemoval(null);
          }
        }}
      />
    </div>
  );
}
