import React, { useState, useMemo } from "react";
import { Sparkles, Sliders, Shield, RefreshCw, Compass, ArrowRight, Check, Plus, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

interface FelineSpaceHarmonizerProps {
  products: Product[];
  onNavigate: (tab: string, productId?: string) => void;
  onAddToCart: (product: Product, size?: string, color?: { name: string; value: string }) => void;
}

type FelinePersona = "explorer" | "lounger" | "sensitive";
type SpaceSize = "compact" | "spacious";
type FocalGoal = "hydration" | "scratching" | "sleeping" | "play";

export default function FelineSpaceHarmonizer({
  products,
  onNavigate,
  onAddToCart,
}: FelineSpaceHarmonizerProps) {
  // Assessment state
  const [companionName, setCompanionName] = useState<string>("");
  const [persona, setPersona] = useState<FelinePersona>("lounger");
  const [space, setSpace] = useState<SpaceSize>("compact");
  const [goal, setGoal] = useState<FocalGoal>("sleeping");
  
  // Quick Add state
  const [addedId, setAddedId] = useState<string | null>(null);

  // Derive ideal product and curation advice
  const harmonization = useMemo(() => {
    // Filter down to cat products
    const catProds = products.filter((p) => p.category === "cats");
    
    let selectedProductId = "merino-wool-nest"; // fallback
    let tip = "";
    let score = 95;

    if (persona === "explorer") {
      if (goal === "scratching") {
        selectedProductId = "organic-cat-scratcher";
        tip = "Your companion seeks high elevation and rigorous vertical expression. The weighted Birch Scratching Pillar provides the necessary skeletal traction without shifting, creating a safe territorial anchor.";
        score = 99;
      } else if (goal === "play") {
        selectedProductId = "catnip-teaser-wand";
        tip = "High energy explorers require cognitive tactile stimulation. The premium silk tassels and potent Oregon catnip wand trigger graceful hunting leaps, beautifully engaging their wild nature.";
        score = 98;
      } else {
        selectedProductId = "walnut-cat-hammock";
        tip = "Active climbers appreciate elevated surveillance heights. Mounting the American Walnut Hammock near a window creates an elegant floating look and satisfies their deep-seated instinct for security.";
        score = 96;
      }
    } else if (persona === "lounger") {
      if (goal === "sleeping") {
        selectedProductId = "merino-wool-nest";
        tip = "Regal loungers favor dim, sound-insulated capsules. The Merino Wool Nest cushions their joints and preserves body heat. Placing this on a low shelf creates a cozy, sculptural sanctuary.";
        score = 99;
      } else if (goal === "hydration") {
        selectedProductId = "ceramic-cat-fountain";
        tip = "A gentle lounger appreciates quiet, low-friction hydration. The heavy Japanese Stoneware Fountain runs silently, ensuring peaceful refreshment that keeps flat-faced breeds comfortable.";
        score = 97;
      } else {
        selectedProductId = "walnut-cat-hammock";
        tip = "A classic lounger thrives on sun-bathed elevation. Double-layered linen on the Walnut Hammock cradles their posture, providing perfect decompression for afternoon slumbers.";
        score = 98;
      }
    } else { // sensitive
      if (goal === "hydration") {
        selectedProductId = "ceramic-cat-fountain";
        tip = "Sensitive feline nervous systems are easily startled by pump vibration. Our Stoneware fountain features a custom low-voltage silent motor, encouraging vital hydration without whisker strain.";
        score = 99;
      } else if (goal === "sleeping") {
        selectedProductId = "merino-wool-nest";
        tip = "For cats easily overstimulated by background noise, the felted organic Merino Wool pod dampens external soundwaves, enclosing your companion in calm, secure silence.";
        score = 98;
      } else {
        selectedProductId = "organic-cat-scratcher";
        tip = "Delicate stretchers require stable, non-slippery textured fibers. The premium woven sisal on our pillar offers predictable friction without tearing claws, giving comforting muscle release.";
        score = 95;
      }
    }

    // Find the actual product in our master array
    const targetProduct = catProds.find((p) => p.id === selectedProductId) || catProds[0];

    return {
      product: targetProduct,
      tip,
      score,
    };
  }, [products, persona, space, goal]);

  const handleQuickAdd = (product: Product) => {
    const size = product.sizes ? product.sizes[0] : undefined;
    const color = product.colors ? product.colors[0] : undefined;
    onAddToCart(product, size, color);

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="bg-white border border-brand-warm-gray p-6 md:p-8 mb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-warm-gray/60 pb-5 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-sage/10 text-brand-sage border border-brand-sage/30 text-[10px] font-mono uppercase tracking-widest font-bold mb-2">
            <Compass className="w-3.5 h-3.5" /> Interactive Spatial Tool
          </span>
          <h2 className="text-xl font-display font-medium text-brand-charcoal">
            The Feline Space Harmonizer
          </h2>
          <p className="text-xs text-brand-charcoal/50 font-mono mt-0.5">
            Optimize your interior synergy and feline wellness through curated companion design
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-brand-charcoal/60 bg-brand-oatmeal px-3 py-1.5 border border-brand-warm-gray/40">
          <Sliders className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>Configurator Engine v1.2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Companion Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-2 font-bold">
                1. Companion's Name
              </label>
              <input
                type="text"
                placeholder="e.g. Luna (Optional)"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-brand-cream"
              />
            </div>

            {/* Feline Persona */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-2 font-bold">
                2. Feline Temperament & Persona
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "explorer", label: "Active Explorer", desc: "Climbs, leaps, high energy" },
                  { id: "lounger", label: "Regal Lounger", desc: "Quiet, seeks warm sunbeams" },
                  { id: "sensitive", label: "Quiet Guardian", desc: "Easily startled, vigilant" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id as FelinePersona)}
                    className={`p-3 text-left border transition-all flex flex-col justify-between cursor-pointer rounded-none ${
                      persona === p.id
                        ? "border-brand-charcoal bg-brand-charcoal text-white"
                        : "border-brand-warm-gray bg-white hover:bg-brand-oatmeal text-brand-charcoal"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-1">{p.label}</span>
                    <span className={`text-[9px] font-light leading-snug ${persona === p.id ? "text-brand-sand" : "text-brand-charcoal/60"}`}>
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Living Space Scale */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-2 font-bold">
                3. Living Space Scale
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "compact", label: "Compact Living", desc: "Studio, urban flat, cozy apartment" },
                  { id: "spacious", label: "Spacious Habitat", desc: "Sprawling loft, detached home" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpace(s.id as SpaceSize)}
                    className={`p-3 text-left border transition-all flex flex-col cursor-pointer rounded-none ${
                      space === s.id
                        ? "border-brand-charcoal bg-brand-charcoal text-white"
                        : "border-brand-warm-gray bg-white hover:bg-brand-oatmeal text-brand-charcoal"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-1">{s.label}</span>
                    <span className={`text-[9px] font-light leading-snug ${space === s.id ? "text-brand-sand" : "text-brand-charcoal/60"}`}>
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Goal */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-2 font-bold">
                4. Curation Focal Point
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "sleeping", label: "Quiet Rest" },
                  { id: "hydration", label: "Hydration" },
                  { id: "scratching", label: "Scratching" },
                  { id: "play", label: "Sensory Play" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as FocalGoal)}
                    className={`py-2 px-1 text-center border text-[11px] font-mono transition-all cursor-pointer rounded-none ${
                      goal === g.id
                        ? "border-brand-terracotta bg-brand-terracotta text-white font-bold"
                        : "border-brand-warm-gray bg-white hover:bg-brand-oatmeal text-brand-charcoal"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Insight Box */}
          <div className="bg-[#FAF9F6] border border-brand-warm-gray/40 p-4 mt-4 relative">
            <span className="text-[9px] font-mono text-brand-terracotta uppercase tracking-widest block mb-1 font-bold">
              Curator's Environmental Alignment Insight
            </span>
            <p className="text-xs text-brand-charcoal/80 leading-relaxed font-light">
              {companionName ? <strong className="font-medium text-brand-charcoal">{companionName}'s </strong> : "Your companion's "}
              {harmonization.tip}
            </p>
          </div>
        </div>

        {/* Right Side: Output & Recommended Item */}
        <div className="lg:col-span-5 bg-brand-oatmeal border border-brand-warm-gray/60 p-5 flex flex-col justify-between">
          <div>
            {/* Synergy Score Meter */}
            <div className="text-center pb-4 border-b border-brand-warm-gray/60 mb-4">
              <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-widest block mb-1">
                Synergy Score
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-4xl font-mono font-bold text-brand-charcoal">
                  {harmonization.score}%
                </span>
                <span className="text-brand-sage text-xs font-mono uppercase tracking-widest font-semibold bg-brand-sage/10 px-2 py-0.5 border border-brand-sage/30">
                  Ideal Match
                </span>
              </div>
              <div className="w-full bg-brand-warm-gray/40 h-1.5 mt-3 overflow-hidden">
                <motion.div
                  key={harmonization.score}
                  initial={{ width: 0 }}
                  animate={{ width: `${harmonization.score}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-brand-sage"
                />
              </div>
            </div>

            {/* Curated Suggestion Title */}
            <div className="mb-3 text-center lg:text-left">
              <span className="text-[9px] font-mono uppercase text-brand-terracotta tracking-wider font-semibold">
                RECOMMENDED DESIGN PIECE
              </span>
            </div>

            {/* Curated Product Showcase */}
            {harmonization.product && (
              <div className="bg-white border border-brand-warm-gray/50 overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-brand-cream overflow-hidden">
                  <img
                    src={harmonization.product.image}
                    alt={harmonization.product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 border border-brand-warm-gray/60 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 text-brand-charcoal">
                    {harmonization.product.brand}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-brand-charcoal/80 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-1">
                    ₹{harmonization.product.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-display font-medium text-brand-charcoal line-clamp-1 mb-1">
                      {harmonization.product.name}
                    </h4>
                    <p className="text-[11px] text-brand-charcoal/60 leading-normal line-clamp-2 mb-3">
                      {harmonization.product.description}
                    </p>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {harmonization.product.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] font-mono text-brand-charcoal/50 bg-[#FAF9F6] border border-brand-warm-gray/45 px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          {harmonization.product && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => onNavigate("details", harmonization.product.id)}
                className="w-full py-2.5 border border-brand-charcoal hover:bg-brand-charcoal hover:text-white text-xs font-mono text-brand-charcoal uppercase tracking-wider transition-colors cursor-pointer rounded-none"
              >
                View Specs
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(harmonization.product)}
                className={`w-full py-2.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer rounded-none ${
                  addedId === harmonization.product.id
                    ? "bg-brand-sage text-white border border-brand-sage"
                    : "bg-brand-charcoal text-white hover:bg-brand-sage border border-brand-charcoal hover:border-brand-sage"
                }`}
              >
                {addedId === harmonization.product.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Quick Add
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
