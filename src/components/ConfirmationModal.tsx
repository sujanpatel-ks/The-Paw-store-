/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  itemDetails?: {
    name?: string;
    image?: string;
    meta?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  itemDetails,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-brand-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md p-6 border-2 border-brand-warm-gray shadow-2xl relative rounded-none text-left"
        >
          {/* Close button top right */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title Header */}
          <div className="flex items-start gap-3.5 mb-3">
            <div
              className={`p-2.5 shrink-0 ${
                variant === "danger"
                  ? "bg-red-50 text-brand-terracotta border border-red-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {variant === "danger" ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-terracotta font-bold block">
                Confirmation Required
              </span>
              <h3 className="text-lg font-display font-bold text-brand-charcoal leading-tight">
                {title}
              </h3>
            </div>
          </div>

          {/* Main Message */}
          <p className="text-xs font-sans text-brand-charcoal/80 leading-relaxed mb-4">
            {message}
          </p>

          {/* Item details card if provided */}
          {itemDetails && (
            <div className="flex items-center gap-3 p-3 bg-brand-cream/60 border border-brand-warm-gray/50 mb-5 font-mono text-xs">
              {itemDetails.image && (
                <img
                  src={itemDetails.image}
                  alt={itemDetails.name || "Item"}
                  className="w-12 h-12 object-cover border border-brand-warm-gray shrink-0"
                />
              )}
              <div className="truncate">
                {itemDetails.name && (
                  <div className="font-display font-semibold text-brand-charcoal text-xs truncate">
                    {itemDetails.name}
                  </div>
                )}
                {itemDetails.meta && (
                  <div className="text-[10px] text-brand-charcoal/60 truncate mt-0.5">
                    {itemDetails.meta}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-warm-gray/40">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white text-brand-charcoal hover:bg-brand-oatmeal border border-brand-warm-gray text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-brand-terracotta text-white hover:bg-brand-charcoal text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
