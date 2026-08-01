/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Star, Heart, ShoppingBag, Plus, Minus, Check, ArrowRight, ShieldCheck, Truck, RefreshCw, Leaf, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; value: string }, giftNote?: string) => void;
  onNavigate: (tab: string, productId?: string) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onOpenNotifyModal?: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onNavigate,
  favorites,
  onToggleFavorite,
  onOpenNotifyModal,
}: QuickViewModalProps) {
  if (!product || !isOpen) return null;

  // Selected state
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ""
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string; image?: string } | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [giftNote, setGiftNote] = useState<string>("");
  const [showGiftInput, setShowGiftInput] = useState<boolean>(false);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      setQuantity(1);
      setActiveImage(product.image);
      setIsAdded(false);
      setGiftNote("");
      setShowGiftInput(false);
    }
  }, [product]);

  // Update active image if selected color has an image
  useEffect(() => {
    if (selectedColor?.image) {
      setActiveImage(selectedColor.image);
    }
  }, [selectedColor]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAddToCartClick = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedSize || undefined, selectedColor, giftNote.trim() || undefined);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleViewFullDetails = () => {
    onClose();
    onNavigate("details", product.id);
  };

  const isFavorite = favorites.includes(product.id);

  // All available preview images
  const allImages = [
    product.image,
    ...(product.secondaryImages || []),
    ...(product.colors?.map((c) => c.image).filter((img): img is string => Boolean(img)) || [])
  ].filter((img, index, self) => self.indexOf(img) === index);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-white border border-brand-warm-gray shadow-2xl z-10 overflow-hidden my-auto rounded-none"
        >
          {/* Header Bar with Quick View Tag & Close Button */}
          <div className="flex items-center justify-between px-6 py-4 bg-brand-oatmeal/80 border-b border-brand-warm-gray/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-brand-charcoal font-semibold uppercase">
                Bespoke Quick View
              </span>
              <span className="text-brand-charcoal/30 font-mono text-xs">/</span>
              <span className="text-xs font-mono text-brand-charcoal/60 uppercase">{product.brand}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-white transition-all rounded-full border border-transparent hover:border-brand-warm-gray/60 cursor-pointer"
              title="Close Quick View (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-h-[80vh] overflow-y-auto">
            {/* Left Column: Image Gallery Showcase */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-square bg-brand-oatmeal overflow-hidden border border-brand-warm-gray/40 group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Brand & Category badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-charcoal border border-brand-warm-gray/40 shadow-xs">
                    {product.category}
                  </span>
                  {product.category === "eco-friendly" && (
                    <span className="bg-emerald-600 text-white px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 shadow-xs">
                      <Leaf className="w-3 h-3" /> Eco-Sourced
                    </span>
                  )}
                </div>

                {/* Favorite Heart Toggle */}
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md border border-brand-warm-gray/40 text-brand-charcoal hover:text-brand-terracotta hover:scale-110 shadow-sm transition-all cursor-pointer"
                  title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? "fill-brand-terracotta text-brand-terracotta" : "text-brand-charcoal/60"
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-16 h-16 border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        activeImage === imgUrl
                          ? "border-brand-charcoal ring-1 ring-brand-charcoal"
                          : "border-brand-warm-gray/60 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Trust Highlights */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] font-mono text-brand-charcoal/70 border-t border-brand-warm-gray/30">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                  <span>White-Glove Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                  <span>Lifetime Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details & Purchase Controls */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-terracotta font-semibold">
                    {product.brand}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="font-bold text-brand-charcoal">{product.rating.toFixed(1)}</span>
                    <span className="text-brand-charcoal/40">({product.reviewsCount} reviews)</span>
                  </div>
                </div>

                <h2 className="text-2xl font-display font-medium text-brand-charcoal leading-tight">
                  {product.name}
                </h2>

                <div className="mt-2 text-xl font-mono font-semibold text-brand-charcoal">
                  ₹{product.price.toFixed(2)}
                </div>
              </div>

              {/* Product description */}
              <p className="text-xs text-brand-charcoal/75 leading-relaxed font-light border-y border-brand-warm-gray/30 py-3">
                {product.description}
              </p>

              {/* Tags pills */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-brand-oatmeal text-brand-charcoal/70 text-[10px] font-mono uppercase tracking-wider border border-brand-warm-gray/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="uppercase text-brand-charcoal/60 font-semibold">Select Size:</span>
                    <span className="text-brand-charcoal font-semibold">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 text-xs font-mono uppercase transition-all cursor-pointer border ${
                          selectedSize === sz
                            ? "bg-brand-charcoal text-white border-brand-charcoal font-semibold shadow-xs"
                            : "bg-white text-brand-charcoal border-brand-warm-gray hover:border-brand-charcoal"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Swatch Picker */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="uppercase text-brand-charcoal/60 font-semibold">Select Finish/Color:</span>
                    <span className="text-brand-charcoal font-semibold">{selectedColor?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c);
                          if (c.image) setActiveImage(c.image);
                        }}
                        title={c.name}
                        className={`w-8 h-8 rounded-full transition-all relative flex items-center justify-center cursor-pointer border ${
                          selectedColor?.name === c.name
                            ? "ring-2 ring-offset-2 ring-brand-charcoal border-brand-charcoal scale-110"
                            : "border-brand-warm-gray/80 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {selectedColor?.name === c.name && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              c.value.toLowerCase() === "#ffffff" || c.value.toLowerCase() === "#e5dec9"
                                ? "bg-black"
                                : "bg-white"
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker & Gift Option */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-brand-charcoal/60 font-semibold">Quantity:</span>
                  <div className="flex items-center border border-brand-warm-gray bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors cursor-pointer"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1 text-xs font-mono font-semibold text-brand-charcoal">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Gift Note Toggle */}
                {!showGiftInput ? (
                  <button
                    type="button"
                    onClick={() => setShowGiftInput(true)}
                    className="text-[11px] font-mono text-brand-terracotta hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    + Add Gift Message
                  </button>
                ) : (
                  <div className="space-y-1 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60">
                        Gift Message:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGiftInput(false);
                          setGiftNote("");
                        }}
                        className="text-[10px] font-mono text-brand-charcoal/40 hover:text-brand-charcoal"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="e.g. For Buster on his birthday!"
                      className="w-full px-3 py-1.5 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage rounded-none"
                    />
                  </div>
                )}
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3 pt-2">
                {product.inStock === false ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNotifyModal?.(product);
                    }}
                    className="w-full py-3.5 px-6 font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer rounded-none bg-brand-charcoal text-white hover:bg-brand-terracotta"
                  >
                    <Bell className="w-4 h-4 text-brand-sand animate-bounce" />
                    Notify Me When Available
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCartClick}
                    className={`w-full py-3.5 px-6 font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer rounded-none ${
                      isAdded
                        ? "bg-brand-sage text-white"
                        : "bg-brand-charcoal text-white hover:bg-brand-sage"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 animate-scaleUp" /> Added {quantity} to Bag!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag (₹{(product.price * quantity).toFixed(2)})
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleViewFullDetails}
                  className="w-full py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-brand-charcoal border border-brand-warm-gray hover:border-brand-charcoal hover:bg-brand-oatmeal/60 transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none"
                >
                  <span>View Full Product Specs & Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
