/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Bell, Check, X, Mail, Sparkles, PackageCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

interface NotifyMeModalProps {
  isOpen: boolean;
  product: Product | null;
  defaultEmail?: string;
  isAlreadyRequested?: boolean;
  onClose: () => void;
  onSubmit: (product: Product, email: string) => void;
}

export default function NotifyMeModal({
  isOpen,
  product,
  defaultEmail = "sarah.j@example.com",
  isAlreadyRequested = false,
  onClose,
  onSubmit,
}: NotifyMeModalProps) {
  const [email, setEmail] = useState<string>(defaultEmail);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setIsSubmitted(isAlreadyRequested);
      setEmailError("");
    }
  }, [isOpen, defaultEmail, isAlreadyRequested]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    onSubmit(product, trimmed);
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-brand-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md p-6 border-2 border-brand-warm-gray shadow-2xl relative rounded-none text-left"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 text-brand-terracotta mb-2 font-mono text-[10px] uppercase tracking-widest font-bold">
            <Bell className="w-4 h-4 text-brand-terracotta animate-bounce" />
            <span>Back-In-Stock Alert</span>
          </div>

          <h3 className="text-xl font-display font-bold text-brand-charcoal leading-tight mb-2">
            Notify Me When Available
          </h3>

          <p className="text-xs font-sans text-brand-charcoal/70 leading-relaxed mb-4">
            This artisanal item is currently out of stock. Leave your email below and we'll send an instant priority notification the moment our next batch arrives.
          </p>

          {/* Product Mini Preview Card */}
          <div className="flex items-center gap-3.5 p-3 bg-brand-cream/60 border border-brand-warm-gray/60 mb-5 font-mono text-xs">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-cover border border-brand-warm-gray shrink-0"
            />
            <div className="truncate flex-grow">
              <span className="text-[9px] uppercase tracking-wider text-brand-terracotta font-bold block">
                {product.brand} • {product.category}
              </span>
              <div className="font-display font-medium text-brand-charcoal text-sm truncate">
                {product.name}
              </div>
              <div className="text-xs font-bold font-sans text-brand-charcoal mt-0.5">
                ${product.price.toFixed(2)}
              </div>
            </div>
            <div className="px-2 py-1 bg-red-100 border border-red-200 text-red-800 text-[9px] font-mono uppercase tracking-wider font-bold shrink-0">
              Out of Stock
            </div>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold font-mono text-xs uppercase tracking-wider">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                Notification Request Active!
              </div>
              <p className="text-xs font-sans leading-relaxed text-emerald-800/80">
                We've saved your request for <strong className="font-semibold">{product.name}</strong>. An email notification will be sent to <span className="underline">{email}</span> as soon as stock is replenished.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-5 py-2 bg-emerald-700 text-white hover:bg-emerald-800 font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer w-full"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/70 font-bold mb-1.5">
                  Notification Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="e.g. sarah.j@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-terracotta rounded-none text-brand-charcoal font-sans"
                    required
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-brand-charcoal/40" />
                </div>
                {emailError && (
                  <p className="text-[10px] font-mono text-brand-terracotta mt-1">{emailError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-terracotta font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Notify Me When Available
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
