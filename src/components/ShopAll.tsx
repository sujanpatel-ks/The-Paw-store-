/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { Filter, SlidersHorizontal, Search, Star, Plus, Check, ShoppingBag, Heart, X, Leaf, Eye, Sparkles, ChevronRight, Bell } from "lucide-react";
import { Product } from "../types";
import FelineSpaceHarmonizer from "./FelineSpaceHarmonizer";
import QuickViewModal from "./QuickViewModal";

interface ShopAllProps {
  products: Product[];
  onNavigate: (tab: string, productId?: string) => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; value: string }) => void;
  searchQuery: string;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onOpenNotifyModal?: (product: Product) => void;
}

export default function ShopAll({
  products,
  onNavigate,
  onAddToCart,
  searchQuery: initialSearch,
  favorites,
  onToggleFavorite,
  onOpenNotifyModal,
}: ShopAllProps) {
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || "");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(250);

  // Autocomplete Suggestions logic from products array
  const autocompleteMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [products, searchQuery]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // New modern real-time filters
  const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  const handleOpenQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // Keep search state in sync with global query triggers (e.g. navigation header search proxy)
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Available brands dynamic extraction
  const brands = useMemo(() => {
    const list = new Set(products.map((p) => p.brand));
    return Array.from(list);
  }, [products]);

  // Handle brand toggle
  const toggleBrand = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  // Determine if any filters are active
  const hasAnyActiveFilter = useMemo(() => {
    return (
      selectedCategory !== "all" ||
      searchQuery !== "" ||
      maxPrice < 250 ||
      selectedBrands.length > 0 ||
      ecoFriendlyOnly ||
      priceRange !== "all" ||
      ratingFilter !== "all"
    );
  }, [selectedCategory, searchQuery, maxPrice, selectedBrands, ecoFriendlyOnly, priceRange, ratingFilter]);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "all") {
          if (selectedCategory === "dogs" && p.category !== "dogs") return false;
          if (selectedCategory === "cats" && p.category !== "cats") return false;
          if (selectedCategory === "eco-friendly" && p.category !== "eco-friendly") return false;
          if (selectedCategory === "essentials" && p.category !== "essentials") return false;
        }

        // Eco-friendly toggle filter (Category-level or Tag/Keyword checks)
        if (ecoFriendlyOnly) {
          const isEcoCategory = p.category === "eco-friendly";
          const hasEcoTag = p.tags.some((t) =>
            ["organic", "biodegradable", "hemp", "sustainable", "natural", "eco-friendly", "sisal"].includes(t.toLowerCase())
          );
          const hasEcoKeyword =
            p.name.toLowerCase().includes("organic") ||
            p.name.toLowerCase().includes("sustainable") ||
            p.name.toLowerCase().includes("hemp") ||
            p.name.toLowerCase().includes("natural") ||
            p.name.toLowerCase().includes("sisal") ||
            p.description.toLowerCase().includes("organic") ||
            p.description.toLowerCase().includes("sustainable") ||
            p.description.toLowerCase().includes("hemp") ||
            p.description.toLowerCase().includes("natural") ||
            p.description.toLowerCase().includes("sisal");

          if (!isEcoCategory && !hasEcoTag && !hasEcoKeyword) return false;
        }

        // Price range quick filter
        if (priceRange !== "all") {
          if (priceRange === "under-50" && p.price > 50) return false;
          if (priceRange === "50-150" && (p.price <= 50 || p.price > 150)) return false;
          if (priceRange === "over-150" && p.price <= 150) return false;
        }

        // Price cap filter (slider)
        if (p.price > maxPrice) return false;

        // Rating filter
        if (ratingFilter === "high" && p.rating < 4.8) return false;

        // Search query
        if (searchQuery.trim() !== "") {
          const s = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(s);
          const matchDesc = p.description.toLowerCase().includes(s);
          const matchBrand = p.brand.toLowerCase().includes(s);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(s));
          if (!matchName && !matchDesc && !matchBrand && !matchTag) return false;
        }

        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // "featured" (default order)
      });
  }, [products, selectedCategory, searchQuery, maxPrice, selectedBrands, sortBy, ecoFriendlyOnly, priceRange, ratingFilter]);

  // Quick Add function
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // Use first size/color option if present, else empty
    const size = product.sizes ? product.sizes[0] : undefined;
    const color = product.colors ? product.colors[0] : undefined;
    onAddToCart(product, size, color);

    // Show temporary success feedback on button
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header section with search bar built in */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-warm-gray pb-8 mb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
            Bespoke Collection
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-light text-brand-charcoal">
            The <span className="font-semibold">Curated Catalog</span>
          </h1>
        </div>

        {/* Search Input with quick clear and dynamic keywords */}
        <div className="w-full md:w-96 flex flex-col gap-2 relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search our fine items..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-brand-warm-gray focus:outline-none focus:border-brand-terracotta text-sm font-light rounded-none shadow-xs"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-charcoal/40" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 p-0.5 hover:bg-brand-oatmeal rounded-full transition-all text-brand-charcoal/50 hover:text-brand-charcoal cursor-pointer"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* AUTOCOMPLETE DROPDOWN */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 bg-white border border-brand-warm-gray shadow-xl mt-1 divide-y divide-brand-warm-gray/30 font-mono text-xs">
                <div className="p-2 bg-brand-cream/80 text-[10px] uppercase font-bold text-brand-terracotta tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-brand-terracotta" />
                    Product Autocomplete ({autocompleteMatches.length})
                  </span>
                  <span className="text-brand-charcoal/40 font-normal">Click to apply</span>
                </div>
                {autocompleteMatches.length > 0 ? (
                  autocompleteMatches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.name);
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center justify-between p-2.5 hover:bg-brand-oatmeal/70 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-cover border border-brand-warm-gray shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-display text-xs text-brand-charcoal group-hover:text-brand-terracotta font-medium block truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] text-brand-charcoal/50 uppercase tracking-wider block">
                            {item.brand} • {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-sans font-bold text-xs text-brand-charcoal">
                          ${item.price.toFixed(2)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-brand-charcoal/30 group-hover:text-brand-terracotta transition-colors" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-brand-charcoal/50 italic text-[11px]">
                    No matching product names
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-brand-charcoal/65">
            <span className="text-brand-charcoal/45 uppercase tracking-wider">Quick keywords:</span>
            {[
              { text: "Beds", value: "bed" },
              { text: "Stoneware", value: "ceramic" },
              { text: "Organic", value: "organic" },
              { text: "Leather", value: "leather" },
              { text: "Sisal", value: "sisal" },
            ].map((term) => (
              <button
                key={term.text}
                onClick={() => setSearchQuery(term.value)}
                className={`px-2 py-0.5 border border-brand-warm-gray/50 hover:border-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all rounded-none ${
                  searchQuery.toLowerCase() === term.value.toLowerCase() ? "bg-brand-charcoal text-white border-brand-charcoal font-semibold" : "bg-transparent text-brand-charcoal"
                }`}
              >
                {term.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasAnyActiveFilter && (
        <div className="flex flex-wrap items-center gap-2 bg-brand-oatmeal/40 border border-brand-warm-gray/30 p-3.5 mb-8 text-xs animate-fadeIn">
          <span className="font-mono text-xs text-brand-charcoal/60 uppercase tracking-wider font-semibold mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-brand-terracotta" /> Active Refinements:
          </span>
          
          {/* Category Chip */}
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-warm-gray/70 font-mono text-[11px] text-brand-charcoal shadow-xs">
              Collection: <span className="font-semibold uppercase text-[10px]">{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory("all")}
                className="hover:text-brand-terracotta text-brand-charcoal/40 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Search Chip */}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-warm-gray/70 font-mono text-[11px] text-brand-charcoal shadow-xs">
              Search: <span className="font-semibold italic">"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery("")}
                className="hover:text-brand-terracotta text-brand-charcoal/40 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Price Segment Chip */}
          {priceRange !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-warm-gray/70 font-mono text-[11px] text-brand-charcoal shadow-xs">
              Price: <span className="font-semibold">
                {priceRange === "under-50" ? "Under ₹50" : priceRange === "50-150" ? "₹50 – ₹150" : "₹150+"}
              </span>
              <button
                onClick={() => setPriceRange("all")}
                className="hover:text-brand-terracotta text-brand-charcoal/40 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Price Cap Chip */}
          {maxPrice < 250 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-warm-gray/70 font-mono text-[11px] text-brand-charcoal shadow-xs">
              Cap: <span className="font-semibold">Under ₹{maxPrice}</span>
              <button
                onClick={() => setMaxPrice(250)}
                className="hover:text-brand-terracotta text-brand-charcoal/40 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Eco-Friendly Chip */}
          {ecoFriendlyOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 font-mono text-[11px] text-emerald-800 shadow-xs">
              <Leaf className="w-3 h-3 text-emerald-600 fill-emerald-100" />
              <span className="font-semibold">Eco-Friendly</span>
              <button
                onClick={() => setEcoFriendlyOnly(false)}
                className="hover:text-brand-terracotta text-emerald-600/50 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Rating Chip */}
          {ratingFilter === "high" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 font-mono text-[11px] text-amber-800 shadow-xs">
              <Star className="w-3 h-3 text-amber-500 fill-amber-300" />
              <span className="font-semibold">Top Rated (4.8+)</span>
              <button
                onClick={() => setRatingFilter("all")}
                className="hover:text-brand-terracotta text-amber-600/50 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Brands Chips */}
          {selectedBrands.map((brand) => (
            <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-warm-gray/70 font-mono text-[11px] text-brand-charcoal shadow-xs">
              Brand: <span className="font-semibold">{brand}</span>
              <button
                onClick={() => toggleBrand(brand)}
                className="hover:text-brand-terracotta text-brand-charcoal/40 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Reset All */}
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setMaxPrice(250);
              setSelectedBrands([]);
              setEcoFriendlyOnly(false);
              setPriceRange("all");
              setRatingFilter("all");
              setSortBy("featured");
            }}
            className="ml-auto font-mono text-[10px] font-bold text-brand-terracotta hover:underline uppercase tracking-wider pl-4 transition-all cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Side: Filter Panels */}
        <div className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="flex items-center gap-2 border-b border-brand-warm-gray pb-4">
            <SlidersHorizontal className="w-4 h-4 text-brand-charcoal" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-brand-charcoal font-semibold">
              Refine Search
            </h2>
          </div>

          {/* Categories Filter list */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 mb-4 font-bold">
              Collections
            </h3>
            <div className="space-y-2">
              {[
                { id: "all", label: "Shop All" },
                { id: "dogs", label: "Dogs Range" },
                { id: "cats", label: "Cats Range" },
                { id: "essentials", label: "Essentials" },
                { id: "eco-friendly", label: "Eco-Friendly" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left py-1.5 px-2.5 text-sm transition-all flex items-center justify-between rounded-none ${
                    selectedCategory === cat.id
                      ? "bg-brand-charcoal text-white font-medium"
                      : "text-brand-charcoal/80 hover:bg-brand-oatmeal"
                  }`}
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.id && <span className="w-1.5 h-1.5 bg-brand-sand rounded-full"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Specialized Curation Checklist */}
          <div className="border-t border-brand-warm-gray/30 pt-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 mb-4 font-bold">
              Specialized Curation
            </h3>
            <div className="space-y-3.5">
              {/* Eco-Friendly checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group text-sm text-brand-charcoal/85 hover:text-brand-charcoal select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={ecoFriendlyOnly}
                    onChange={(e) => setEcoFriendlyOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4.5 h-4.5 border transition-all flex items-center justify-center ${
                    ecoFriendlyOnly
                      ? "bg-emerald-600 border-emerald-600"
                      : "border-brand-warm-gray bg-white group-hover:border-brand-charcoal"
                  }`}>
                    {ecoFriendlyOnly && <Check className="w-3.5 h-3.5 text-white animate-scaleUp" />}
                  </div>
                </div>
                <span className="font-light flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Eco-Friendly Sourced
                </span>
              </label>

              {/* Rating selection checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group text-sm text-brand-charcoal/85 hover:text-brand-charcoal select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter === "high"}
                    onChange={(e) => setRatingFilter(e.target.checked ? "high" : "all")}
                    className="sr-only"
                  />
                  <div className={`w-4.5 h-4.5 border transition-all flex items-center justify-center ${
                    ratingFilter === "high"
                      ? "bg-amber-500 border-amber-500"
                      : "border-brand-warm-gray bg-white group-hover:border-brand-charcoal"
                  }`}>
                    {ratingFilter === "high" && <Check className="w-3.5 h-3.5 text-white animate-scaleUp" />}
                  </div>
                </div>
                <span className="font-light flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Top Rated (4.8★ or Higher)
                </span>
              </label>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-brand-warm-gray/30 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 font-bold">
                Price Cap
              </h3>
              <span className="text-xs font-mono text-brand-charcoal font-semibold">
                Under ₹{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-brand-charcoal bg-brand-warm-gray/60 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-brand-charcoal/50 mt-1">
              <span>₹20</span>
              <span>₹135</span>
              <span>₹250</span>
            </div>
          </div>

          {/* Brand Filter Checklist */}
          <div className="border-t border-brand-warm-gray/30 pt-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 mb-4 font-bold">
              Curator Brands
            </h3>
            <div className="space-y-2.5">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group text-sm text-brand-charcoal/85 hover:text-brand-charcoal select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="sr-only"
                    />
                    <div className={`w-4.5 h-4.5 border transition-all flex items-center justify-center ${
                      selectedBrands.includes(brand)
                        ? "bg-brand-charcoal border-brand-charcoal"
                        : "border-brand-warm-gray bg-white group-hover:border-brand-charcoal"
                    }`}>
                      {selectedBrands.includes(brand) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="font-light">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setMaxPrice(250);
              setSelectedBrands([]);
              setEcoFriendlyOnly(false);
              setPriceRange("all");
              setRatingFilter("all");
              setSortBy("featured");
            }}
            className="w-full py-2.5 text-xs font-mono border border-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-colors uppercase tracking-wider rounded-none cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>

        {/* Right Side: Sorting & Product Grid */}
        <div className="flex-grow">
          {selectedCategory === "cats" && (
            <FelineSpaceHarmonizer
              products={products}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
            />
          )}

          {/* Real-time Quick Filtering Ribbon (Instant Sync) */}
          <div className="bg-white border border-brand-warm-gray/30 p-5 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-warm-gray/15 pb-4">
              {/* Category Quick Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-brand-charcoal/50 uppercase block">
                  Quick Category
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Shop All" },
                    { id: "dogs", label: "Dogs Range" },
                    { id: "cats", label: "Cats Range" },
                    { id: "essentials", label: "Essentials" },
                    { id: "eco-friendly", label: "Eco-Friendly" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-mono transition-all rounded-none cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-brand-charcoal text-white font-medium"
                          : "bg-brand-oatmeal/60 text-brand-charcoal hover:bg-brand-oatmeal hover:text-brand-charcoal"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Quick Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-brand-charcoal/50 uppercase block">
                  Price Range Segments
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Any Price" },
                    { id: "under-50", label: "Under ₹50" },
                    { id: "50-150", label: "₹50 – ₹150" },
                    { id: "over-150", label: "₹150+" },
                  ].map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => setPriceRange(pr.id)}
                      className={`px-3 py-1.5 text-xs font-mono transition-all rounded-none cursor-pointer ${
                        priceRange === pr.id
                          ? "bg-brand-terracotta text-white font-medium"
                          : "bg-brand-oatmeal/60 text-brand-charcoal hover:bg-brand-oatmeal hover:text-brand-charcoal"
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Feature Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[10px] font-mono tracking-widest text-brand-charcoal/50 uppercase">
                Instant Curation:
              </span>
              
              {/* Eco-Friendly Toggle Pill */}
              <button
                onClick={() => setEcoFriendlyOnly(!ecoFriendlyOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono transition-all rounded-none border cursor-pointer ${
                  ecoFriendlyOnly
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                    : "bg-transparent border-brand-warm-gray text-brand-charcoal/80 hover:border-brand-charcoal"
                }`}
              >
                <Leaf className={`w-3.5 h-3.5 ${ecoFriendlyOnly ? "text-emerald-600 fill-emerald-200" : "text-brand-charcoal/40"}`} />
                <span>Eco-Friendly Sourced</span>
              </button>

              {/* Highly Rated Toggle Pill */}
              <button
                onClick={() => setRatingFilter(ratingFilter === "high" ? "all" : "high")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono transition-all rounded-none border cursor-pointer ${
                  ratingFilter === "high"
                    ? "bg-amber-50 border-amber-300 text-amber-800 font-medium"
                    : "bg-transparent border-brand-warm-gray text-brand-charcoal/80 hover:border-brand-charcoal"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${ratingFilter === "high" ? "text-amber-500 fill-amber-300" : "text-brand-charcoal/40"}`} />
                <span>Top Rated (★ 4.8+)</span>
              </button>
            </div>
          </div>

          {/* Top sorting bar */}
          <div className="flex justify-between items-center bg-brand-oatmeal p-4 mb-8 border border-brand-warm-gray/40 text-xs font-mono">
            <span className="text-brand-charcoal/60">
              Showing {filteredProducts.length} premium results
            </span>
            <div className="flex items-center gap-2">
              <span className="text-brand-charcoal/60">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-medium text-brand-charcoal focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Favorites</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated (★)</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-brand-warm-gray">
              <p className="text-lg text-brand-charcoal/50 font-light mb-4">No companion pieces match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setMaxPrice(250);
                  setSelectedBrands([]);
                  setEcoFriendlyOnly(false);
                  setPriceRange("all");
                  setRatingFilter("all");
                }}
                className="px-6 py-2 bg-brand-charcoal text-white text-xs font-mono uppercase tracking-widest rounded-none hover:bg-brand-sage transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate("details", prod.id)}
                  className="group cursor-pointer flex flex-col h-full bg-white border border-brand-warm-gray/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Photo area */}
                  <div className="relative aspect-square overflow-hidden bg-brand-oatmeal">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Favorite Heart Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(prod.id);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-brand-warm-gray/40 text-brand-charcoal hover:text-brand-terracotta hover:scale-105 shadow-sm transition-all cursor-pointer"
                      title={favorites.includes(prod.id) ? "Remove from Favorites" : "Save to Favorites"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-all ${
                          favorites.includes(prod.id) ? "fill-brand-terracotta text-brand-terracotta" : "text-brand-charcoal/60"
                        }`}
                      />
                    </button>

                    {/* Quick View and Quick Add / Notify Me Buttons on Hover */}
                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 px-3 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenQuickView(e, prod)}
                        className="px-3 py-2.5 shadow-xl font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-brand-charcoal hover:bg-brand-charcoal hover:text-white cursor-pointer"
                        title="Quick View key details"
                      >
                        <Eye className="w-3.5 h-3.5" /> Quick View
                      </button>

                      {prod.inStock === false ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNotifyModal?.(prod);
                          }}
                          className="px-3 py-2.5 shadow-xl font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-brand-charcoal text-white hover:bg-brand-terracotta cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" /> Notify Me
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, prod)}
                          className={`px-3 py-2.5 shadow-xl font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer ${
                            addedProductId === prod.id
                              ? "bg-brand-sage text-white"
                              : "bg-white text-brand-charcoal hover:bg-brand-charcoal hover:text-white"
                          }`}
                        >
                          {addedProductId === prod.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Quick Add
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Brand Tag & Out of Stock Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                      <div className="bg-white/90 backdrop-blur-sm border border-brand-warm-gray/55 text-[9px] font-mono font-medium uppercase tracking-widest px-2.5 py-1 text-brand-charcoal">
                        {prod.brand}
                      </div>
                      {prod.inStock === false && (
                        <div className="bg-red-800 text-white border border-red-900 text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="text-base font-display font-medium text-brand-charcoal group-hover:text-brand-terracotta transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                      <span className="font-mono text-sm text-brand-charcoal font-semibold">
                        ₹{prod.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-brand-charcoal/70 font-light line-clamp-2 mb-4 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Star Rating Panel */}
                    <div className="mt-auto pt-4 border-t border-brand-oatmeal flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-brand-terracotta text-brand-terracotta" />
                        <span className="text-[11px] font-mono font-semibold text-brand-charcoal">
                          {prod.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-mono text-brand-charcoal/40">
                          ({prod.reviewsCount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleOpenQuickView(e, prod)}
                        className="text-[10px] font-mono tracking-widest text-brand-terracotta font-semibold uppercase hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Quick View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
        onNavigate={onNavigate}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
