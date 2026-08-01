import React, { useState } from "react";
import { X, Sparkles, AlertCircle, RefreshCw, Layers, Save } from "lucide-react";
import UploadWidget from "./UploadWidget";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  logoUrl?: string; // Optional watermark logo
  authToken: string;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, storeId, logoUrl, authToken, onSuccess }: AddProductModalProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "dogs",
    weightLbs: "",
    color: "",
    petType: "dog",
    localPrice: "",
    stockQuantity: ""
  });

  // Track which fields were auto-filled to display blue highlights
  const [autoFilledFields, setAutoFilledFields] = useState<Record<string, boolean>>({
    productName: false,
    brand: false,
    category: false,
    weightLbs: false,
    color: false,
    petType: false
  });

  if (!isOpen) return null;

  const handleUploadComplete = async (secureUrl: string, pubId: string) => {
    setImageUrl(secureUrl);
    setPublicId(pubId);
    setAiLoading(true);
    setAiError(null);
    setIsCached(false);

    try {
      const res = await fetch("/api/partner/ai-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ imageUrl: secureUrl })
      });
      const data = await res.json();
      
      if (data.error) {
        setAiError(data.error);
      } else {
        setFormData(prev => ({
          ...prev,
          productName: data.productName || "",
          brand: data.brand || "",
          category: data.category || "dogs",
          weightLbs: data.weightLbs !== null && data.weightLbs !== undefined ? String(data.weightLbs) : "",
          color: data.color || "",
          petType: data.petType || "dog"
        }));
        setIsCached(!!data.cached);
        setAutoFilledFields({
          productName: !!data.productName,
          brand: !!data.brand,
          category: !!data.category,
          weightLbs: data.weightLbs !== null && data.weightLbs !== undefined,
          color: !!data.color,
          petType: !!data.petType
        });
      }
    } catch (err: any) {
      setAiError("AI could not parse this image. Please fill in fields manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // If the user manual-edits an auto-filled field, remove the highlight
    if (autoFilledFields[field]) {
      setAutoFilledFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setSaveError("Please upload a product image first.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const payload = {
      productName: formData.productName,
      brand: formData.brand,
      category: formData.category,
      weightLbs: formData.weightLbs ? Number(formData.weightLbs) : null,
      localPrice: Number(formData.localPrice),
      stockQuantity: Number(formData.stockQuantity),
      shelfImageUrl: imageUrl,
      cloudinaryPublicId: publicId
    };

    try {
      const res = await fetch("/api/partner/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save inventory.");
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save product inventory.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setImageUrl("");
    setPublicId("");
    setAiLoading(false);
    setAiError(null);
    setSaveError(null);
    setIsCached(false);
    setFormData({
      productName: "",
      brand: "",
      category: "dogs",
      weightLbs: "",
      color: "",
      petType: "dog",
      localPrice: "",
      stockQuantity: ""
    });
    setAutoFilledFields({
      productName: false,
      brand: false,
      category: false,
      weightLbs: false,
      color: false,
      petType: false
    });
    onClose();
  };

  // Watermark preview URL builder
  const getWatermarkPreviewUrl = () => {
    if (!imageUrl) return "";
    if (!logoUrl) return imageUrl;
    
    // Parse cloudName out of the URL or default to matching standard structure
    // URL format: https://res.cloudinary.com/{cloudName}/image/upload/v{version}/{publicId}.{format}
    const searchStr = "/image/upload/";
    const index = imageUrl.indexOf(searchStr);
    if (index === -1) return imageUrl;

    const prefix = imageUrl.substring(0, index + searchStr.length);
    const suffix = imageUrl.substring(index + searchStr.length);
    
    // Simply overlay logoUrl (or parse its publicId if it's a full URL)
    // Assume a default logo overlay or the specified logoUrl public ID
    let logoId = "paw_logo"; // Fallback default public ID
    if (logoUrl.includes("/image/upload/")) {
      const parts = logoUrl.split("/");
      const lastPart = parts[parts.length - 1];
      logoId = lastPart.split(".")[0];
    } else {
      logoId = logoUrl;
    }

    const transform = `w_300,h_300,c_fill/l_${logoId},w_50,h_50,g_west,x_10,y_10/`;
    return `${prefix}${transform}${suffix}`;
  };

  const displayImageUrl = showWatermark && logoUrl ? getWatermarkPreviewUrl() : imageUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-charcoal/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-brand-warm-gray/25 max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-warm-gray/15 flex items-center justify-between bg-brand-sand/15">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-terracotta" />
            <h2 className="text-base font-display font-semibold text-brand-charcoal uppercase tracking-wider">
              Add Partner Product to Catalog
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-brand-charcoal/40 hover:bg-brand-warm-gray/10 hover:text-brand-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top: Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Product Image Upload (Shelfie)
            </label>
            <UploadWidget
              storeId={storeId}
              authToken={authToken}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Cloudinary Watermark Preview Control */}
          {imageUrl && logoUrl && (
            <div className="flex items-center justify-between p-3 bg-brand-sand/10 border border-brand-warm-gray/15 rounded-lg">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-brand-charcoal">Watermark Overlay Preview</span>
                <p className="text-[10px] text-brand-charcoal/40 font-mono">Simulate logo stamping on shelf assets</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-terracotta"></div>
              </label>
            </div>
          )}

          {/* Image & AI Analyzing States */}
          {imageUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-sand/5 p-4 rounded-xl border border-brand-warm-gray/15">
              <div className="flex items-center justify-center border border-brand-warm-gray/10 rounded bg-white p-2">
                <img
                  src={displayImageUrl}
                  alt="Product preview"
                  className="max-h-40 object-contain rounded"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2">
                {aiLoading && (
                  <div className="space-y-2 animate-pulse">
                    <div className="flex items-center gap-1.5 text-xs text-brand-terracotta font-mono font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI IS ANALYZING IMAGE...</span>
                    </div>
                    <div className="h-4 bg-brand-warm-gray/10 rounded w-3/4"></div>
                    <div className="h-4 bg-brand-warm-gray/10 rounded w-1/2"></div>
                  </div>
                )}

                {!aiLoading && !aiError && (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1 text-emerald-600 font-mono font-bold uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Scan Complete</span>
                    </div>
                    <p className="text-brand-charcoal/60 font-mono text-[10px]">
                      Taxonomy fields auto-filled below. Review and adjust if necessary.
                    </p>
                    {isCached && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-mono rounded">
                        Cache Hit
                      </span>
                    )}
                  </div>
                )}

                {aiError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => handleFieldChange("productName", e.target.value)}
                placeholder="e.g. Grain Free Adult Dog Kibble"
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded ${
                  autoFilledFields.productName
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              />
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Brand
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => handleFieldChange("brand", e.target.value)}
                placeholder="e.g. Purina"
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded ${
                  autoFilledFields.brand
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Boutique Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded bg-white ${
                  autoFilledFields.category
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              >
                <option value="dogs">Dogs (Beds, Collars, Accessories)</option>
                <option value="cats">Cats (Harmonizers, Beds)</option>
                <option value="eco-friendly">Eco-Friendly Accessories</option>
                <option value="essentials">Essentials & Gourmet Treats</option>
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="any"
                value={formData.weightLbs}
                onChange={(e) => handleFieldChange("weightLbs", e.target.value)}
                placeholder="e.g. 15"
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded ${
                  autoFilledFields.weightLbs
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                placeholder="e.g. Charcoal Black"
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded ${
                  autoFilledFields.color
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              />
            </div>

            {/* Pet Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Pet Suitability
              </label>
              <select
                value={formData.petType}
                onChange={(e) => handleFieldChange("petType", e.target.value)}
                className={`w-full px-3 py-2 border text-xs transition-all outline-none rounded bg-white ${
                  autoFilledFields.petType
                    ? "border-blue-400 bg-blue-50/5 focus:border-blue-500"
                    : "border-brand-warm-gray/30 focus:border-brand-charcoal"
                }`}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="both">Both (Universal)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-brand-warm-gray/10 pt-4 flex gap-2">
            <span className="text-[10px] font-mono text-brand-terracotta uppercase font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Store Specific Inventory Details
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Local Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.localPrice}
                onChange={(e) => handleFieldChange("localPrice", e.target.value)}
                placeholder="e.g. 45.99"
                className="w-full px-3 py-2 border border-brand-warm-gray/30 focus:border-brand-charcoal text-xs outline-none rounded"
              />
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/50">
                Initial Stock Level
              </label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => handleFieldChange("stockQuantity", e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-brand-warm-gray/30 focus:border-brand-charcoal text-xs outline-none rounded"
              />
            </div>
          </div>

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex gap-2 items-center">
              <AlertCircle className="w-4 h-4" />
              <span>{saveError}</span>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-brand-warm-gray/15 flex justify-end gap-3 bg-brand-sand/5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-brand-warm-gray/40 text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors text-xs uppercase font-mono tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || aiLoading || !imageUrl}
            className="px-5 py-2 bg-brand-charcoal text-white hover:bg-brand-terracotta disabled:bg-brand-charcoal/40 transition-colors text-xs uppercase font-mono tracking-wider flex items-center gap-1.5"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
