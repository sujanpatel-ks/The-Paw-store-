/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Star, ChevronRight, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Heart, X, Ruler, Scale, Calculator, Info, Check, UserCheck, ShieldAlert, MessageSquare, Calendar, Gift, Mic, MicOff, Dog, Sparkles, Sliders, CheckCircle2, Bell, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

export interface Review {
  id: string;
  rating: number;
  title: string;
  author: string;
  companionName?: string;
  companionBreed?: string;
  comment: string;
  date: string;
  verified: boolean;
}

const getInitialReviews = (productId: string): Review[] => {
  if (productId === "cloud-bed") {
    return [
      {
        id: "rev-cb-1",
        rating: 5,
        title: "An absolute dream for my Weimaraner",
        author: "Sarah",
        companionName: "Max",
        companionBreed: "Weimaraner",
        comment: "We chose the Oatmeal Sand cover, and it coordinates flawlessly with our travertine fireplace. Max sinks right into the triple-density memory foam and stays perfectly sound asleep for hours. The washability of the canvas is extraordinary.",
        date: "July 02, 2026",
        verified: true,
      },
      {
        id: "rev-cb-2",
        rating: 4,
        title: "Excellent orthopedic decompression",
        author: "Dr. Elizabeth Mercer (DVM)",
        companionName: "Cleo",
        companionBreed: "Golden Retriever",
        comment: "As a practicing veterinarian, I am incredibly demanding regarding orthopedic pet sleeping solutions. The composite memory foam core provides superb skeletal decompression without bottoming out. Highly recommended, though the box was slightly heavy.",
        date: "June 25, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "ceramic-bowl") {
    return [
      {
        id: "rev-cbw-1",
        rating: 5,
        title: "Stately stoneware, zero skidding!",
        author: "Charlotte",
        companionName: "Oscar",
        companionBreed: "British Shorthair",
        comment: "Simply stunning glazes. The sage green is an elegant earth tone. My active kitten Oscar used to push his bowls across the entire kitchen floor, but the sheer weight of this hand-glazed stoneware completely anchors it. Easy to hand-wash too.",
        date: "June 20, 2026",
        verified: true,
      },
      {
        id: "rev-cbw-2",
        rating: 5,
        title: "Whisker Fatigue Savior",
        author: "Winston's Guardian",
        companionName: "Winston",
        companionBreed: "French Bulldog",
        comment: "Frenchies suffer from flat muzzles and high whisker sensitivity. The wide, shallow medium bowl is an absolute game-changer. He can eat without nose pressure or face irritation. Highly recommend to flat-faced breed curators.",
        date: "May 18, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "woven-leather-leash") {
    return [
      {
        id: "rev-wll-1",
        rating: 5,
        title: "Masterful Tuscan Braiding",
        author: "Arthur",
        companionName: "Barnaby",
        companionBreed: "Beagle",
        comment: "The stitching integrity is marvelous. The solid brass hardware has a heavy, satisfying spring trigger action. I walk Barnaby twice a day on Seattle trails, and the saddle leather has already begun developing a glorious rich vintage patina.",
        date: "June 14, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "premium-velvet-bed") {
    return [
      {
        id: "rev-pvb-1",
        rating: 5,
        title: "A Regal Throne for Lady Chloe",
        author: "Penelope",
        companionName: "Chloe",
        companionBreed: "King Charles Spaniel",
        comment: "Purchased the Sapphire Velvet in Medium, and it is truly fit for royalty. The velvet cover is surprisingly water-repellent and spot-cleans like a dream. Chloe curls up in the piping border and sleeps soundly. A masterful piece of companion furniture.",
        date: "May 29, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "artisanal-treats") {
    return [
      {
        id: "rev-at-1",
        rating: 5,
        title: "Wholesome and Delicious",
        author: "Evelyn",
        companionName: "Bella",
        companionBreed: "Labrador",
        comment: "Usually, Bella experiences severe digestive sensitivities, but this grain-free ancient grain blend is incredibly gentle. She sits by the pantry door each morning with unmatched focus. Pure, high-mass nutrition.",
        date: "July 10, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "sustainable-hemp-leash") {
    return [
      {
        id: "rev-shl-1",
        rating: 5,
        title: "Sublime strength, soft on hands",
        author: "Liam",
        companionName: "Cooper",
        companionBreed: "Golden Retriever",
        comment: "Hemp is an incredible material. It is lightweight, does not absorb odor, and has a very organic look. Even with heavy pulling, the soft hemp fibers do not burn my hands. A triumph of ecological design.",
        date: "July 05, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "leather-collar") {
    return [
      {
        id: "rev-lc-1",
        rating: 5,
        title: "Impeccable Fit and Safety",
        author: "Sophia",
        companionName: "Teddy",
        companionBreed: "Poodle",
        comment: "Matched this in Terracotta Sand with the woven leash. The saddle leather is supple right out of the box and does not pinch his fur. The safety brass buckle holds perfectly under high tension. Truly heirloom quality.",
        date: "June 11, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "organic-cat-scratcher") {
    return [
      {
        id: "rev-ocs-1",
        rating: 5,
        title: "Sculptural Masterpiece",
        author: "Marcus",
        companionName: "Nala",
        companionBreed: "Bengal",
        comment: "Usually cat posts ruin the visual lines of a modern living space. This is a work of structural art. The thick, hand-woven sisal stands up to intense Bengal scratching, and the solid heavy birch wood base keeps it totally rock solid. Brilliant.",
        date: "April 21, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "merino-wool-nest") {
    return [
      {
        id: "rev-mwn-1",
        rating: 5,
        title: "Pure feline sanctuary",
        author: "Genevieve",
        companionName: "Winston",
        companionBreed: "British Shorthair",
        comment: "The Merino wool is exceptionally soft yet holds its architectural dome structure perfectly. Winston was inside it within five minutes of unboxing. It looks like a beautiful natural river stone in our minimal living room.",
        date: "July 12, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "ceramic-cat-fountain") {
    return [
      {
        id: "rev-ccf-1",
        rating: 5,
        title: "Whisper-quiet and stunning",
        author: "Alistair",
        companionName: "Cleo",
        companionBreed: "Ragdoll",
        comment: "I have gone through three plastic cat fountains that looked dreadful and buzzed constantly. This Japanese stoneware is an absolute masterpiece. It is completely silent—all you hear is a delicate, soothing water trickle, and Cleo drinks from it constantly.",
        date: "July 14, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "walnut-cat-hammock") {
    return [
      {
        id: "rev-wch-1",
        rating: 5,
        title: "Superb architectural joinery",
        author: "Julian",
        companionName: "Ziggy",
        companionBreed: "Abyssinian",
        comment: "The American walnut grain is gorgeous and matches our premium mid-century credenza flawlessly. Extremely robust mounting and the double-layered ivory linen supports Ziggy's 14lb athletic frame with ease.",
        date: "July 08, 2026",
        verified: true,
      }
    ];
  }
  if (productId === "catnip-teaser-wand") {
    return [
      {
        id: "rev-ctw-1",
        rating: 5,
        title: "Playtime elevated to art",
        author: "Beatrix",
        companionName: "Oliver",
        companionBreed: "Siamese",
        comment: "This wand is exceptionally balanced and beautiful. The raw silk tassels move with a mesmerizing grace, and the hand-stitched organic hemp pouch loaded with Oregon catnip drove Oliver absolutely wild. Highly recommend this designer toy.",
        date: "July 15, 2026",
        verified: true,
      }
    ];
  }
  return [
    {
      id: "rev-gen-1",
      rating: 5,
      title: "Exquisite Companion Item",
      author: "Honored Curator",
      companionName: "Companion",
      comment: "Superb material curation and exquisite attention to detail. This exceeds standard boutique quality, performing elegantly in daily use.",
      date: "May 01, 2026",
      verified: true,
    }
  ];
};

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, size?: string, color?: { name: string; value: string }, giftNote?: string) => void;
  onNavigate: (tab: string, productId?: string) => void;
  relatedProducts: Product[];
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  currentUser?: string | null;
  onOpenNotifyModal?: (product: Product) => void;
}

export default function ProductDetails({
  product,
  onAddToCart,
  onNavigate,
  relatedProducts,
  favorites,
  onToggleFavorite,
  currentUser,
  onOpenNotifyModal,
}: ProductDetailsProps) {
  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string }>({ name: "", value: "" });
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  // High-Resolution Image Hover-Zoom states
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState<number>(2.5);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  // Bespoke Gift Note & Voice Dictation states
  const [giftNote, setGiftNote] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);

  // Check speech support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError("");
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Permission to use microphone was denied.");
        } else {
          setSpeechError(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setGiftNote((prev) => {
            const trimmedPrev = prev.trim();
            const chunk = finalTranscript.trim();
            const merged = trimmedPrev ? `${trimmedPrev} ${chunk}` : chunk;
            return merged.slice(0, 200);
          });
        }
      };

      rec.start();
      setRecognition(rec);
    } catch (err: any) {
      console.error(err);
      setSpeechError("Failed to initialize speech recognition.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Terminate recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  // Reviews & Rating states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewRatingHover, setReviewRatingHover] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("");
  const [compName, setCompName] = useState<string>("");
  const [compBreed, setCompBreed] = useState<string>("");
  const [reviewError, setReviewError] = useState<string>("");
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes ? product.sizes[2] || product.sizes[0] : ""); // Select 3rd (Large) or 1st
      setSelectedColor(product.colors ? product.colors[0] : { name: "Default", value: "#000" });
      setActiveImage(product.image);
      setQuantity(1);
      setAddedToCart(false);
      setCalcInput("");
      setModalTab("table");
      setGiftNote("");
      setIsListening(false);

      // Load localized reviews
      const storedKey = `companion_reviews_${product.id}`;
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        try {
          setReviews(JSON.parse(stored));
        } catch {
          const initial = getInitialReviews(product.id);
          setReviews(initial);
          localStorage.setItem(storedKey, JSON.stringify(initial));
        }
      } else {
        const initial = getInitialReviews(product.id);
        setReviews(initial);
        localStorage.setItem(storedKey, JSON.stringify(initial));
      }
      
      // Reset form states
      setReviewRating(5);
      setReviewRatingHover(null);
      setReviewTitle("");
      setReviewComment("");
      setReviewerName(currentUser || "");
      setCompName("");
      setCompBreed("");
      setReviewError("");
      setReviewSuccess(false);
    }
  }, [product, currentUser]);

  // Check if current user has purchased the item
  const hasPurchased = useMemo(() => {
    const purchasedIds = ["premium-velvet-bed", "artisanal-treats", "ceramic-bowl", "woven-leather-leash"];
    return purchasedIds.includes(product.id);
  }, [product.id]);

  // Dynamic reviews rating and count helper
  const { dynamicRating, dynamicCount } = useMemo(() => {
    if (reviews.length === 0) {
      return { dynamicRating: product.rating, dynamicCount: product.reviewsCount };
    }
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / reviews.length;
    return {
      dynamicRating: Number(avg.toFixed(1)),
      dynamicCount: reviews.length
    };
  }, [reviews, product.rating, product.reviewsCount]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);

    if (!reviewerName.trim()) {
      setReviewError("Please provide your name or curator handle.");
      return;
    }
    if (!reviewTitle.trim()) {
      setReviewError("Please write a refined title for your feedback.");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setReviewError("Please share at least a short sentence of refined commentary (min 10 characters).");
      return;
    }

    const newReview: Review = {
      id: `rev-user-${Date.now()}`,
      rating: reviewRating,
      title: reviewTitle.trim(),
      author: reviewerName.trim(),
      companionName: compName.trim() || undefined,
      companionBreed: compBreed.trim() || undefined,
      comment: reviewComment.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
      }),
      verified: hasPurchased && reviewerName.toLowerCase() === (currentUser || "").toLowerCase()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`companion_reviews_${product.id}`, JSON.stringify(updatedReviews));

    setReviewTitle("");
    setReviewComment("");
    setCompName("");
    setCompBreed("");
    setReviewRating(5);
    setReviewSuccess(true);
  };

  // Size chart modal state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"interactive" | "table" | "guide" | "calculator">("interactive");
  const [calcInput, setCalcInput] = useState<string>("");

  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">(() => {
    try {
      const saved = localStorage.getItem("paws_pet_weight_unit");
      if (saved === "lbs" || saved === "kg") return saved;
    } catch (e) {}
    return "lbs";
  });

  const [selectedWeightPreset, setSelectedWeightPreset] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("paws_pet_weight_preset");
      if (saved) return saved;
    } catch (e) {}
    return "25-50";
  });

  const [customWeightSlider, setCustomWeightSlider] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("paws_pet_weight_value");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {}
    return 35;
  });

  useEffect(() => {
    try {
      localStorage.setItem("paws_pet_weight_unit", weightUnit);
      localStorage.setItem("paws_pet_weight_preset", selectedWeightPreset);
      localStorage.setItem("paws_pet_weight_value", customWeightSlider.toString());
    } catch (e) {}
  }, [weightUnit, selectedWeightPreset, customWeightSlider]);

  const [sizeAppliedMsg, setSizeAppliedMsg] = useState<string | null>(null);

  // Interactive Size Helper Recommendation Matrix
  const activeWeightInLbs = useMemo(() => {
    if (weightUnit === "kg") {
      return Math.round(customWeightSlider * 2.20462);
    }
    return customWeightSlider;
  }, [customWeightSlider, weightUnit]);

  const activeRecommendation = useMemo(() => {
    const nameLower = product.name.toLowerCase();
    const idLower = product.id.toLowerCase();
    const w = activeWeightInLbs;

    // 1. Beds / Cushions / Furniture
    if (idLower.includes("bed") || nameLower.includes("bed") || idLower.includes("nest") || nameLower.includes("nest")) {
      if (w <= 20) {
        return {
          recommendedSize: "Small",
          categoryName: "Petite Companion Bed",
          dimensions: "24\" x 18\" x 3.5\"",
          weightCapacity: "Up to 20 lbs (9 kg)",
          breeds: "French Bulldog, Pug, Pomeranian, Cats",
          visualScalePercent: 25,
          reasoning: "Perfect ergonomic contouring for small bodies. Provides soft edge nesting and thermal regulation.",
          fitBadge: "Optimal Petite Fit",
        };
      } else if (w <= 45) {
        return {
          recommendedSize: "Medium",
          categoryName: "Medium Companion Orthopedic Bed",
          dimensions: "32\" x 24\" x 4.0\"",
          weightCapacity: "Up to 45 lbs (20 kg)",
          breeds: "Corgi, Beagle, Cocker Spaniel, Shiba Inu",
          visualScalePercent: 50,
          reasoning: "Generous sleeping surface with 4-inch high-density memory foam core preventing joint strain.",
          fitBadge: "Optimal Medium Fit",
        };
      } else if (w <= 80) {
        return {
          recommendedSize: "Large",
          categoryName: "Large Companion Orthopedic Bed",
          dimensions: "40\" x 30\" x 5.0\"",
          weightCapacity: "Up to 80 lbs (36 kg)",
          breeds: "Golden Retriever, Weimaraner, Boxer, Labrador",
          visualScalePercent: 75,
          reasoning: "Heavy-duty 5-inch composite orthopedic core. Accommodates full sprawl posture without bottoming out.",
          fitBadge: "Optimal Heavy-Duty Fit",
        };
      } else {
        return {
          recommendedSize: "X-Large",
          categoryName: "Extra Large Regal Companion Bed",
          dimensions: "48\" x 36\" x 6.0\"",
          weightCapacity: "Up to 120 lbs (54 kg)",
          breeds: "Great Dane, Mastiff, Bernese Mountain Dog",
          visualScalePercent: 95,
          reasoning: "Maximum structural support with 6-inch orthopedic density and wide perimeter support.",
          fitBadge: "Regal Giant Fit",
        };
      }
    }

    // 2. Collars / Leashes
    if (idLower.includes("collar") || nameLower.includes("collar") || idLower.includes("leash") || nameLower.includes("leash")) {
      if (w <= 12) {
        return {
          recommendedSize: "XS",
          categoryName: "Delicate Neckband (8\" - 11\")",
          dimensions: "Neck: 8\" - 11\" | Width: 0.50\"",
          weightCapacity: "Up to 12 lbs (5.5 kg)",
          breeds: "Chihuahua, Toy Poodle, Italian Greyhound, Pomeranian",
          visualScalePercent: 20,
          reasoning: "Ultra-lightweight Tuscan leather band that prevents neck pressure on delicate windpipes.",
          fitBadge: "Featherlight Fit",
        };
      } else if (w <= 25) {
        return {
          recommendedSize: "S",
          categoryName: "Small Companion Neckwear (11\" - 14\")",
          dimensions: "Neck: 11\" - 14\" | Width: 0.75\"",
          weightCapacity: "Up to 25 lbs (11.5 kg)",
          breeds: "Jack Russell, Shih Tzu, Boston Terrier, Cavalier",
          visualScalePercent: 40,
          reasoning: "Reinforced 0.75-inch saddle leather band for active small dogs.",
          fitBadge: "Snug Active Fit",
        };
      } else if (w <= 50) {
        return {
          recommendedSize: "M",
          categoryName: "Medium Companion Neckwear (14\" - 18\")",
          dimensions: "Neck: 14\" - 18\" | Width: 1.00\"",
          weightCapacity: "Up to 50 lbs (23 kg)",
          breeds: "French Bulldog, Shiba Inu, Beagle, Cocker Spaniel",
          visualScalePercent: 65,
          reasoning: "1.00-inch wide load-distributing band with solid brass trigger hardware.",
          fitBadge: "Balanced Comfort Fit",
        };
      } else {
        return {
          recommendedSize: "L",
          categoryName: "Large Companion Neckwear (18\" - 22\")",
          dimensions: "Neck: 18\" - 22\" | Width: 1.25\"",
          weightCapacity: "Up to 100 lbs (45 kg)",
          breeds: "Golden Retriever, German Shepherd, Weimaraner, Labrador",
          visualScalePercent: 90,
          reasoning: "1.25-inch heavy-duty leather band designed for high tensile strength and neck protection.",
          fitBadge: "Robust High-Strength Fit",
        };
      }
    }

    // 3. Stoneware Bowls
    if (idLower.includes("bowl") || nameLower.includes("bowl") || idLower.includes("fountain") || nameLower.includes("fountain")) {
      if (w <= 15) {
        return {
          recommendedSize: "Small (400ml)",
          categoryName: "Petite Stoneware Feedware",
          dimensions: "Dia: 5.2\" | H: 2.2\" | Vol: 400ml (1.7 Cups)",
          weightCapacity: "Up to 15 lbs (7 kg)",
          breeds: "Cats, Puppies, Toy Breeds",
          visualScalePercent: 30,
          reasoning: "Shallow profile specifically engineered to prevent feline and toy dog whisker fatigue.",
          fitBadge: "Whisker-Safe Fit",
        };
      } else if (w <= 45) {
        return {
          recommendedSize: "Medium (800ml)",
          categoryName: "Standard Companion Stoneware Bowl",
          dimensions: "Dia: 6.8\" | H: 2.8\" | Vol: 800ml (3.4 Cups)",
          weightCapacity: "Up to 45 lbs (20 kg)",
          breeds: "French Bulldogs, Corgis, Beagles",
          visualScalePercent: 60,
          reasoning: "Medium depth with high-mass weighted base completely stopping bowl sliding during mealtime.",
          fitBadge: "Weighted Spill-Free Fit",
        };
      } else {
        return {
          recommendedSize: "Large (1.6L)",
          categoryName: "Large Stoneware Feedware",
          dimensions: "Dia: 8.4\" | H: 3.6\" | Vol: 1.6L (6.7 Cups)",
          weightCapacity: "Up to 100 lbs (45 kg)",
          breeds: "Golden Retrievers, Labradors, Weimaraners",
          visualScalePercent: 90,
          reasoning: "Expanded 1.6-liter volumetric capacity for large feeding portions with zero tipping risk.",
          fitBadge: "Generous Capacity Fit",
        };
      }
    }

    // 4. General / Cat Scratchers / Accessories
    if (w <= 15) {
      return {
        recommendedSize: product.sizes?.[0] || "Small",
        categoryName: "Petite Sizing Range",
        dimensions: "Calibrated for small posture",
        weightCapacity: "Up to 15 lbs (7 kg)",
        breeds: "Cats, Small Terriers, Toy Breeds",
        visualScalePercent: 25,
        reasoning: "Compact footprint suited for apartment living and light bodies.",
        fitBadge: "Compact Size Match",
      };
    } else if (w <= 45) {
      return {
        recommendedSize: product.sizes?.[1] || product.sizes?.[0] || "Medium",
        categoryName: "Standard Medium Sizing Range",
        dimensions: "Calibrated for medium posture",
        weightCapacity: "Up to 45 lbs (20 kg)",
        breeds: "Corgis, Beagles, French Bulldogs",
        visualScalePercent: 60,
        reasoning: "Versatile proportions providing ample room for active everyday use.",
        fitBadge: "Versatile Size Match",
      };
    } else {
      return {
        recommendedSize: product.sizes?.[2] || product.sizes?.[product.sizes.length - 1] || "Large",
        categoryName: "Large Companion Range",
        dimensions: "Calibrated for large posture",
        weightCapacity: "Up to 100 lbs (45 kg)",
        breeds: "Labradors, Retrievers, Large Breeds",
        visualScalePercent: 90,
        reasoning: "Reinforced load-bearing capacity designed for full-grown large companions.",
        fitBadge: "Proportionate Size Match",
      };
    }
  }, [product, activeWeightInLbs]);

  // Dynamic Size Chart definitions depending on category & id
  const sizeGuideData = useMemo(() => {
    const nameLower = product.name.toLowerCase();
    const idLower = product.id.toLowerCase();

    if (idLower.includes("bed") || nameLower.includes("bed")) {
      return {
        type: "beds",
        title: "Orthopedic Sleep Sizing Guide",
        subtitle: "Calibrated to your companion's natural sleeping posture and orthopedic needs.",
        columns: ["Size", "Dimensions (L x W x H)", "Max Weight Limit", "Target Breed Examples"],
        rows: [
          { size: "Small", specs: "24\" x 18\" x 3.5\"", capacity: "", weightRange: "Up to 20 lbs", breeds: "French Bulldog, Pug, Pomeranian, Cats" },
          { size: "Medium", specs: "32\" x 24\" x 4.0\"", capacity: "", weightRange: "Up to 45 lbs", breeds: "Corgi, Beagle, Cocker Spaniel, Shiba Inu" },
          { size: "Large", specs: "40\" x 30\" x 5.0\"", capacity: "", weightRange: "Up to 80 lbs", breeds: "Weimaraner, Golden Retriever, Boxer, Labrador" },
          { size: "X-Large", specs: "48\" x 36\" x 6.0\"", capacity: "", weightRange: "Up to 120 lbs", breeds: "Great Dane, Mastiff, Bernese Mountain Dog" },
        ],
        steps: [
          "Sleeping Style Alignment: If your companion sprawls out completely, choose one size up. If they curl up in a cozy ball, their nose-to-tail size is perfect.",
          "Nose-To-Tail Length: Measure your sleeping companion from the tip of the nose to the base of the tail.",
          "Orthopedic Longevity: Matching weight correctly protects the multi-layer orthotic memory foam core from bottoming-out over years of use."
        ],
        tips: [
          "When in doubt between two sizes, we always advise curating the larger choice to provide a more luxurious and stress-free rest."
        ],
        helperLabel: "Enter your companion's weight (in lbs) to identify the perfect orthotic cushion size:",
        helperPlaceholder: "e.g. 55",
        helperUnit: "lbs",
        calculate: (val: number) => {
          if (val <= 0) return { size: "", reason: "Please enter a valid weight." };
          if (val <= 20) return { size: "Small", reason: "The Small cushion (24\"x18\") perfectly cradles companions up to 20 lbs." };
          if (val <= 45) return { size: "Medium", reason: "The Medium cushion (32\"x24\") offers spacious support for medium breeds up to 45 lbs." };
          if (val <= 80) return { size: "Large", reason: "The Large cushion (40\"x30\") offers elite, heavy-duty support up to 80 lbs, preventing joint bottoming-out." };
          return { size: "X-Large", reason: "The X-Large cushion (48\"x36\") provides expansive orthopedic cushioning for regal giant breeds up to 120 lbs." };
        }
      };
    }

    if (idLower.includes("collar") || nameLower.includes("collar") || idLower.includes("leash") || nameLower.includes("leash")) {
      const isLeashOnly = idLower.includes("leash") && !idLower.includes("collar");
      return {
        type: "neckwear",
        title: isLeashOnly ? "Luxury Leash Dimension Guide" : "Refined Neckwear Sizing Guide",
        subtitle: "Handcrafted neck dimensions to guarantee safety, breathing space, and ultimate comfort.",
        columns: isLeashOnly ? ["Size", "Length", "Band Width", "Recommended Walking Scenario"] : ["Size", "Neck Circumference", "Band Width", "Breed Recommendations"],
        rows: isLeashOnly ? [
          { size: "Standard (5ft)", specs: "5 Feet", capacity: "", weightRange: "All weights", breeds: "Best for city walking, crowded sidewalk safety, and active training." },
          { size: "Standard (4ft)", specs: "4 Feet", capacity: "", weightRange: "All weights", breeds: "High leverage control option." }
        ] : [
          { size: "XS", specs: "8\" - 11\"", capacity: "", weightRange: "0.50\"", breeds: "Chihuahua, Toy Poodle, Italian Greyhound, Pomeranian" },
          { size: "S", specs: "11\" - 14\"", capacity: "", weightRange: "0.75\"", breeds: "Jack Russell, Shih Tzu, Boston Terrier, Cavalier King Charles" },
          { size: "M", specs: "14\" - 18\"", capacity: "", weightRange: "1.00\"", breeds: "French Bulldog, Shiba Inu, Beagle, Cocker Spaniel" },
          { size: "L", specs: "18\" - 22\"", capacity: "", weightRange: "1.25\"", breeds: "Golden Retriever, German Shepherd, Weimaraner, Labrador Retriever" },
        ],
        steps: isLeashOnly ? [
          "Determine Control Needs: Shorter leashes provide high tactile leverage in busy urban settings.",
          "Consider Companion Stature: Smaller dogs often benefit from standard lengths so they have sufficient play, while larger dogs match beautifully with shorter, sturdier options."
        ] : [
          "The Two-Finger Rule: Wrap a soft measuring tape snugly around the base of your companion's neck. Slip two fingers between the tape and their neck.",
          "Threshold Sizing: If they are on the threshold between sizes (e.g., 14 inches), select the larger size (M instead of S) for premium comfort."
        ],
        tips: [
          "Ensure safety clasps are cleared of sand or debris to protect the spring trigger and ensure solid hardware locking."
        ],
        helperLabel: isLeashOnly ? "Enter walk style ('urban' or 'park') to discover the ideal choice:" : "Enter neck circumference (in inches) to recommend the matching collar size:",
        helperPlaceholder: isLeashOnly ? "e.g. urban" : "e.g. 15",
        helperUnit: isLeashOnly ? "style" : "inches",
        calculate: (val: any) => {
          if (isLeashOnly) {
            const style = String(val).toLowerCase();
            if (style.includes("urb") || style.includes("city") || style.includes("train") || style.includes("standard")) {
              return { size: "Standard (5ft)", reason: "Perfect for high-leverage guidance and total safety in crowded metropolitan environments." };
            }
            return { size: "Standard (5ft)", reason: "Exceptional for relaxed open territory or nature walks where your companion can explore safely." };
          }
          const numVal = parseFloat(val);
          if (isNaN(numVal) || numVal <= 0) return { size: "", reason: "Please enter a valid numeric size." };
          if (numVal < 8) return { size: "XS", reason: "XS fits starting from 8 inches. Carefully measure to ensure it isn't too loose." };
          if (numVal <= 11) return { size: "XS", reason: "XS (8\"-11\") is customized to support tiny delicate necks elegantly." };
          if (numVal <= 14) return { size: "S", reason: "S (11\"-14\") offers a robust band width while remaining light and comfortable." };
          if (numVal <= 18) return { size: "M", reason: "M (14\"-18\") is the standard choice for medium, active breeds." };
          if (numVal <= 22) return { size: "L", reason: "L (18\"-22\") features an expanded band width to support and control larger, strong breeds." };
          return { size: "Custom Tailoring", reason: "Neck measurements above 22\" exceed standard production limits. Contact our luxury concierge." };
        }
      };
    }

    if (idLower.includes("bowl") || nameLower.includes("bowl")) {
      return {
        type: "bowls",
        title: "Artisan Feedware Capacity Guide",
        subtitle: "Hand-glazed stoneware volumes calibrated for precise portioning and postural comfort.",
        columns: ["Size", "Volume Capacity", "Dimensions (Dia. x H)", "Target Companion Sizes"],
        rows: [
          { size: "Small (400ml)", specs: "400ml (1.7 Cups)", capacity: "", weightRange: "5.2\" x 2.2\"", breeds: "Cats, Puppies, Toy Breeds (Chihuahuas, Yorkies, Pomeranians)" },
          { size: "Medium (800ml)", specs: "800ml (3.4 Cups)", capacity: "", weightRange: "6.8\" x 2.8\"", breeds: "Medium Breeds (French Bulldogs, Corgis, Beagles)" },
          { size: "Large (1.6L)", specs: "1.6L (6.7 Cups)", capacity: "", weightRange: "8.4\" x 3.6\"", breeds: "Large Breeds (Weimaraners, Golden Retrievers, Labradors)" },
        ],
        steps: [
          "Portion Buffer: Select a bowl capacity that is at least double your companion's single meal portion. This leaves a premium margin to prevent food overspill.",
          "Weighted Design Benefit: Our heavyweight stoneware features high-mass bases that completely eliminate bowl-sliding during energetic eating."
        ],
        tips: [
          "For flat-faced (brachycephalic) breeds like French Bulldogs, our Medium bowl is highly recommended as the wide opening prevents whisker fatigue and nose blocking."
        ],
        helperLabel: "Enter your companion's single dry meal size (in cups) to find the ideal size:",
        helperPlaceholder: "e.g. 1.2",
        helperUnit: "cups",
        calculate: (val: number) => {
          if (val <= 0) return { size: "", reason: "Please enter a valid cup volume." };
          if (val <= 0.8) return { size: "Small (400ml)", reason: "Small holds 1.7 cups, leaving a comfortable clean margin for portions under 0.8 cups." };
          if (val <= 1.5) return { size: "Medium (800ml)", reason: "Medium holds 3.4 cups, leaving a perfect splash-free buffer for portions between 0.8 to 1.5 cups." };
          if (val <= 3.5) return { size: "Large (1.6L)", reason: "Large holds 6.7 cups, offering spacious depth for major feeding portions up to 3.5 cups." };
          return { size: "Multiple Bowls", reason: "For giant portions above 3.5 cups, we suggest split feeding or using our Large stoneware bowl." };
        }
      };
    }

    if (idLower.includes("scratcher") || nameLower.includes("scratcher")) {
      return {
        type: "scratchers",
        title: "Feline Sisal Post Architectural Guide",
        subtitle: "Verifiably engineered to enable full spinal extension for felines of all heights.",
        columns: ["Size", "Total Height", "Base Dimensions", "Sisal Wrap Weight"],
        rows: [
          { size: "Tall (32\")", specs: "32 Inches", capacity: "", weightRange: "12\" x 12\" Birch", breeds: "Heavy-duty organic sisal rope (14 lbs total stability)" },
        ],
        steps: [
          "Torso Extension Rule: Cats scratch to shed claw husks and align their spines. The post height must be at least 1.5x your cat's standing height.",
          "Heavy Anti-Topple Base: Solid, high-density birch provides structural grounding. Energetic larger cats (e.g. Maine Coons) will not tip this post."
        ],
        tips: [
          "Place the architectural scratching pillar in high-traffic family rooms to seamlessly redirect scratching away from fine upholstery."
        ],
        helperLabel: "Enter your feline's torso length from shoulders to hip base (in inches):",
        helperPlaceholder: "e.g. 15",
        helperUnit: "inches",
        calculate: (val: number) => {
          if (val <= 0) return { size: "", reason: "Please enter a valid length." };
          if (val <= 24) return { size: "Tall (32\")", reason: "This 32\" post offers pristine, unrestricted vertical stretch for cats up to 24\" torso length." };
          return { size: "Tall (32\") - Snug", reason: "Cats longer than 24\" can stretch successfully, though they will occasionally touch the birch cap." };
        }
      };
    }

    // Default Generic / Essentials
    return {
      type: "generic",
      title: "The Paws Store Essentials Guide",
      subtitle: "General dimensions and curated recommendations for our lifestyle selection.",
      columns: ["Product Range", "Available Sizes", "Key Advantage", "Ideal For"],
      rows: [
        { size: "Cushions & Beds", specs: "Small to X-Large", capacity: "", weightRange: "Orthopedic Memory Foam", breeds: "Maximum joint decompression and deep sleep cycles." },
        { size: "Stoneware Feedware", specs: "Small, Medium, Large", capacity: "", weightRange: "Weighted Hand-Glazed", breeds: "Clean hygiene, zero slides, perfect posture." },
        { size: "Leather Collars", specs: "XS, S, M, L", capacity: "", weightRange: "Italian Saddle Leather", breeds: "Durable luxury that ages elegantly with brass patina." },
      ],
      steps: [
        "Consult Your Breed: Different breeds have drastically different sizing requirements. Rely on the category specifics.",
        "Precision Measure: Never estimate neck size or beds. A quick measuring tape consultation saves shipping stress."
      ],
      tips: [
        "Need advanced styling sizing? Speak directly with our concierge using the 'Concierge AI Search' module!"
      ],
      helperLabel: "Enter pet weight (in lbs) for general sizing category advice:",
      helperPlaceholder: "e.g. 30",
      helperUnit: "lbs",
      calculate: (val: number) => {
        if (val <= 0) return { size: "", reason: "Please enter a valid weight." };
        if (val <= 15) return { size: "XS or Small Range", reason: "Ideal for delicate toy breeds and cats." };
        if (val <= 45) return { size: "Medium Range", reason: "Standard for active, medium-sized breeds." };
        return { size: "Large or X-Large Range", reason: "Fits majestic larger companions requiring robust materials." };
      }
    };
  }, [product]);

  // Accordion toggles
  const [accordionOpen, setAccordionOpen] = useState<{ desc: boolean; materials: boolean; shipping: boolean }>({
    desc: true,
    materials: false,
    shipping: false,
  });

  // Success indicator
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  // Handle color click (sync image if color provides an image)
  const handleColorSelect = (color: { name: string; value: string; image?: string }) => {
    setSelectedColor(color);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, giftNote.trim() || undefined);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // Get list of images to show in thumbnails
  const thumbnails = [
    product.image,
    ...(product.secondaryImages || []),
    // Inject dynamic images depending on option availability
    ...(product.colors ? product.colors.map(c => c.image).filter((img): img is string => !!img) : [])
  ].filter((img, index, self) => self.indexOf(img) === index).slice(0, 5);

  const toggleAccordion = (key: "desc" | "materials" | "shipping") => {
    setAccordionOpen({
      ...accordionOpen,
      [key]: !accordionOpen[key]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Elegant Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-brand-charcoal/50 uppercase tracking-widest mb-10 bg-brand-oatmeal/65 p-3.5 border-l-2 border-brand-terracotta">
        <span className="cursor-pointer hover:text-brand-terracotta" onClick={() => onNavigate("storefront")}>Home</span>
        <ChevronRight className="w-3 h-3" />
        <span className="cursor-pointer hover:text-brand-terracotta" onClick={() => onNavigate("shop")}>Collections</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-charcoal/80 font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
        {/* Left Side: Dynamic Image Gallery */}
        <div className="space-y-4">
          <div
            className="aspect-[4/3] w-full bg-brand-oatmeal overflow-hidden border border-brand-warm-gray/45 relative shadow-sm cursor-crosshair group select-none"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleImageMouseMove}
          >
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-150 ease-out"
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transform: isZooming ? `scale(${zoomLevel})` : "scale(1)",
              }}
              referrerPolicy="no-referrer"
            />

            {/* Hover-zoom Status Indicator Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
              <div className="bg-brand-charcoal/85 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5 shadow-md border border-white/10">
                <ZoomIn className="w-3.5 h-3.5 text-brand-sand animate-pulse" />
                {isZooming ? `Texture Inspection (${zoomLevel}x)` : "Hover Image To Inspect Weave & Material"}
              </div>
            </div>

            {/* Quick Zoom Level Toggles when Hovering */}
            {isZooming && (
              <div
                className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-brand-charcoal/90 backdrop-blur-md text-white p-1 text-[10px] font-mono shadow-lg border border-white/15"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="px-2 text-brand-sand font-bold text-[9px] uppercase tracking-wider">Magnification:</span>
                {[2, 2.8, 3.8].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomLevel(lvl);
                    }}
                    className={`px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-colors ${
                      zoomLevel === lvl ? "bg-brand-terracotta text-white" : "hover:bg-white/20 text-white/70"
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
            )}

            {/* Precision Loupe Reticle when Zooming */}
            {isZooming && (
              <div
                className="absolute w-10 h-10 rounded-full border border-brand-terracotta/80 bg-brand-terracotta/15 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md backdrop-contrast-125"
                style={{
                  left: `${zoomPosition.x}%`,
                  top: `${zoomPosition.y}%`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-brand-terracotta ring-2 ring-white/80" />
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-5 gap-3">
            {thumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-square w-full border overflow-hidden bg-brand-oatmeal hover:opacity-100 transition-all ${
                  activeImage === img ? "border-brand-terracotta ring-1 ring-brand-terracotta" : "border-brand-warm-gray/60 opacity-70"
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Description, Custom Attributes, Cart Trigger */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase font-bold block mb-1">
              {product.brand}
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-medium text-brand-charcoal mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews block */}
            <div className="flex items-center gap-4 py-2 border-b border-brand-warm-gray pb-4">
              <div className="flex items-center gap-1 text-brand-terracotta">
                <Star className="w-4 h-4 fill-brand-terracotta text-brand-terracotta" />
                <span className="text-sm font-mono font-bold text-brand-charcoal">
                  {dynamicRating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-brand-charcoal/40 font-mono">|</span>
              <span
                onClick={() => {
                  const element = document.getElementById("customer-reviews");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs font-mono text-brand-charcoal/60 underline cursor-pointer hover:text-brand-terracotta"
              >
                Read {dynamicCount} customer testimonies
              </span>
            </div>

            {/* Price tag */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-brand-charcoal">
                ₹{product.price.toFixed(2)}
              </span>
              {product.inStock === false && (
                <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-brand-terracotta text-[10px] font-mono uppercase tracking-widest font-bold">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-brand-charcoal/75 leading-relaxed font-light">
            {product.description}
          </p>

          {/* COLOR SELECTOR */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 font-semibold">
                  Selected Color: <strong className="text-brand-charcoal font-bold">{selectedColor.name}</strong>
                </span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    title={color.name}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      selectedColor.name === color.name ? "ring-2 ring-brand-charcoal ring-offset-2 border-transparent scale-110" : "border-brand-warm-gray"
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor.name === color.name && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm mix-blend-difference"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTOR */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-brand-charcoal/70 font-semibold">
                  Size Choice: <strong className="text-brand-charcoal font-bold">{selectedSize}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("interactive");
                      setIsSizeChartOpen(true);
                    }}
                    className="text-xs font-mono text-brand-terracotta hover:text-brand-charcoal bg-brand-terracotta/10 px-2.5 py-1 border border-brand-terracotta/30 flex items-center gap-1.5 transition-colors font-bold cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5 text-brand-terracotta" />
                    Interactive Size Helper
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("table");
                      setIsSizeChartOpen(true);
                    }}
                    className="text-xs font-mono text-brand-charcoal/50 hover:text-brand-terracotta underline cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5 text-brand-terracotta" />
                    Table
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border text-xs font-mono uppercase tracking-wider transition-all rounded-none ${
                      selectedSize === size
                        ? "bg-brand-charcoal text-white border-brand-charcoal font-bold"
                        : "border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BESPOKE GIFT NOTE VOICE DICTATION */}
          <div className="border border-brand-warm-gray/70 p-4 bg-brand-oatmeal/20 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-terracotta animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-brand-charcoal font-bold">
                  Bespoke Gift Note (Optional)
                </span>
              </div>
              <span className="text-[10px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
                Hand-Written
              </span>
            </div>

            <p className="text-[11px] text-brand-charcoal/60 leading-relaxed font-light">
              Dictate or type a personalized dedication. Our boutique team will scribe your message onto heavyweight cream parchment for your companion's gift.
            </p>

            <div className="relative">
              <textarea
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                maxLength={200}
                placeholder="e.g. To dearest Cooper, enjoy this celestial orthotic bed! With infinite love, Sarah..."
                className="w-full h-24 pl-4 pr-12 py-3 bg-white border border-brand-warm-gray text-xs focus:outline-none focus:border-brand-sage focus:ring-0 rounded-none resize-none font-sans leading-relaxed text-brand-charcoal"
              />

              {/* Dictation Button */}
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
                <AnimatePresence>
                  {isListening && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[9px] font-mono font-bold text-brand-terracotta uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-terracotta"></span>
                      </span>
                      Listening...
                    </motion.span>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 border transition-all duration-300 rounded-none flex items-center justify-center cursor-pointer ${
                    isListening
                      ? "border-brand-terracotta bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/20"
                      : "border-brand-warm-gray bg-white text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-charcoal hover:bg-brand-oatmeal/10"
                  }`}
                  title={isListening ? "Stop Dictating" : "Dictate Note with Microphone"}
                  disabled={!speechSupported}
                >
                  {isListening ? (
                    <MicOff className="w-3.5 h-3.5" />
                  ) : (
                    <Mic className={`w-3.5 h-3.5 ${!speechSupported ? "opacity-30" : ""}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Character Count & Error Handling */}
            <div className="flex justify-between items-center text-[10px] font-mono">
              <div>
                {speechError && (
                  <span className="text-brand-terracotta flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-brand-terracotta inline-block animate-ping"></span>
                    {speechError}
                  </span>
                )}
                {!speechSupported && !speechError && (
                  <span className="text-brand-charcoal/40 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-brand-charcoal/30 shrink-0" />
                    Speech dictation is available in standard modern browsers.
                  </span>
                )}
              </div>
              <span className="text-brand-charcoal/30 shrink-0 ml-auto">
                {giftNote.length}/200 chars
              </span>
            </div>
          </div>

          {/* QUANTITY & ADD TO CART CONTAINER */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Quantity modifier */}
            <div className="flex items-center border border-brand-warm-gray bg-white shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors hover:bg-brand-oatmeal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center font-mono text-sm font-semibold select-none text-brand-charcoal">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors hover:bg-brand-oatmeal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic CTA Button */}
            {product.inStock === false ? (
              <button
                type="button"
                onClick={() => onOpenNotifyModal?.(product)}
                className="flex-grow py-4 px-6 text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-3 rounded-none cursor-pointer bg-brand-charcoal text-white hover:bg-brand-terracotta hover:shadow-xl"
              >
                <Bell className="w-4 h-4 text-brand-sand animate-bounce" />
                Notify Me When Available
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`flex-grow py-4 px-6 text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-3 rounded-none cursor-pointer ${
                  addedToCart
                    ? "bg-brand-sage text-white shadow-md"
                    : "bg-brand-charcoal text-white hover:bg-brand-sage hover:shadow-xl"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {addedToCart ? "Added to Cart Successfully!" : "Add Premium Item to Cart"}
              </button>
            )}

            {/* Favorite / Wishlist Heart Button */}
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`p-4 border transition-all duration-300 flex items-center justify-center rounded-none cursor-pointer ${
                favorites.includes(product.id)
                  ? "border-brand-terracotta text-brand-terracotta bg-brand-terracotta/5"
                  : "border-brand-warm-gray text-brand-charcoal hover:border-brand-charcoal hover:bg-brand-oatmeal/20"
              }`}
              title={favorites.includes(product.id) ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Heart className={`w-4.5 h-4.5 ${favorites.includes(product.id) ? "fill-brand-terracotta text-brand-terracotta" : "text-brand-charcoal/60"}`} />
            </button>
          </div>

          {/* Premium Value Props strip */}
          <div className="grid grid-cols-3 gap-2 text-center py-4 border-y border-brand-warm-gray/60 text-[10px] font-mono text-brand-charcoal/70">
            <div className="flex flex-col items-center gap-1.5 p-1.5">
              <Truck className="w-4 h-4 text-brand-sage" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-sage" />
              <span>2-Year Full Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1.5">
              <RefreshCw className="w-4 h-4 text-brand-sage" />
              <span>30-Day Pure Returns</span>
            </div>
          </div>

          {/* ACCORDION INFO PANELS */}
          <div className="border-t border-brand-warm-gray space-y-px bg-brand-warm-gray/10">
            {/* Panel 1: Description */}
            <div className="border-b border-brand-warm-gray bg-white">
              <button
                onClick={() => toggleAccordion("desc")}
                className="w-full flex justify-between items-center py-4 px-3 text-left font-mono text-xs uppercase tracking-wider text-brand-charcoal font-bold"
              >
                <span>Premium Specifications</span>
                {accordionOpen.desc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.desc && (
                <div className="px-3 pb-4 text-xs text-brand-charcoal/70 font-light leading-relaxed space-y-2">
                  <p>• Premium dual-density high-performance orthotic base memory foam.</p>
                  <p>• Heavyweight 100% luxury cotton furniture-grade exterior fabric canvas.</p>
                  <p>• Breathable water-resistant inner protective protective layers.</p>
                  <p>• Solid hidden brass zippers prevent digging and floor marks.</p>
                </div>
              )}
            </div>

            {/* Panel 2: Materials Care */}
            <div className="border-b border-brand-warm-gray bg-white">
              <button
                onClick={() => toggleAccordion("materials")}
                className="w-full flex justify-between items-center py-4 px-3 text-left font-mono text-xs uppercase tracking-wider text-brand-charcoal font-bold"
              >
                <span>Material Integrity & Care</span>
                {accordionOpen.materials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.materials && (
                <div className="px-3 pb-4 text-xs text-brand-charcoal/70 font-light leading-relaxed space-y-2">
                  <p>Remove the zippered cover. Wash in cold cycle with similar neutral shades using mild natural detergents.</p>
                  <p>Tumble dry at low temperatures. Avoid heavy bleaching or aggressive chemical agents. Do not wash the foam core directly.</p>
                </div>
              )}
            </div>

            {/* Panel 3: Shipping */}
            <div className="border-b border-brand-warm-gray bg-white">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex justify-between items-center py-4 px-3 text-left font-mono text-xs uppercase tracking-wider text-brand-charcoal font-bold"
              >
                <span>White Glove Shipping & Returns</span>
                {accordionOpen.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {accordionOpen.shipping && (
                <div className="px-3 pb-4 text-xs text-brand-charcoal/70 font-light leading-relaxed">
                  <p>All items in The Paws Store catalog are eligible for complimentary Standard Shipping. Overnight express shipping option available during checkout stage.</p>
                  <p className="mt-2">We provide 30 days of complimentary return service for unopened, unused items in pristine packaging conditions.</p>
                </div>
              )}
             </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <section id="customer-reviews" className="border-t border-brand-warm-gray pt-16 pb-8 scroll-mt-24">
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
            Verified Experiences
          </span>
          <h2 className="text-2xl font-display font-medium text-[#1A1A18]">
            Customer Testimonies
          </h2>
          <p className="text-xs text-brand-charcoal/50 font-mono mt-1">
            Chronicles of comfort and craft from our distinguished curator community
          </p>
        </div>

        {/* Aggregate Ratings Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#FDFBF7] border border-brand-warm-gray/60 p-6 mb-12">
          {/* Average Rating Score */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-brand-warm-gray/60">
            <span className="text-5xl font-mono font-bold text-brand-charcoal leading-none">
              {dynamicRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5 text-brand-terracotta mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(dynamicRating)
                      ? "fill-brand-terracotta text-brand-terracotta"
                      : "text-brand-warm-gray/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-widest mt-2">
              Based on {dynamicCount} Certified Log{dynamicCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Rating Breakdown Progress Bars */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-center space-y-2 px-2 md:px-6">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 text-brand-charcoal/70 flex items-center gap-1 justify-end">
                    {stars} <Star className="w-3 h-3 fill-brand-charcoal text-brand-charcoal inline" />
                  </span>
                  <div className="flex-grow h-2 bg-brand-warm-gray/20 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-brand-charcoal transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-brand-charcoal/50">
                    {count} ({Math.round(percent)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Form & Review List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Column A: Left - Review Form */}
          <div className="lg:col-span-5 bg-white border border-brand-warm-gray/60 p-6 sticky top-24">
            <h3 className="text-sm font-mono uppercase tracking-wider text-brand-charcoal font-bold mb-1 pb-3 border-b border-brand-warm-gray/60">
              Submit Testimonial
            </h3>
            
            {reviewSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-brand-sage/10 border border-brand-sage text-center"
              >
                <Check className="w-10 h-10 text-brand-sage mx-auto mb-3" />
                <h4 className="font-display font-medium text-brand-charcoal text-base mb-1">
                  Testimonial Certified
                </h4>
                <p className="text-xs text-brand-charcoal/80 leading-relaxed max-w-sm mx-auto">
                  Your refined experiences with the {product.name} have been registered in our curator index. Thank you for your distinguished contribution.
                </p>
                <button
                  type="button"
                  onClick={() => setReviewSuccess(false)}
                  className="mt-4 px-4 py-1.5 bg-brand-charcoal text-white hover:bg-brand-sage transition-colors font-mono text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Write Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                {/* Info and Verification Badge */}
                {hasPurchased ? (
                  <div className="bg-brand-sage/5 border border-brand-sage/30 p-3 flex gap-2.5 items-start">
                    <UserCheck className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-brand-charcoal/80">
                      <span className="font-bold text-brand-sage">Verified Patron Account</span> — Our register indicates that {currentUser || "you"} acquired this item. Your review will display an heirloom-level verification badge.
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-sand/10 border border-brand-warm-gray/40 p-3 flex gap-2.5 items-start">
                    <Info className="w-4 h-4 text-brand-terracotta shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-brand-charcoal/70">
                      <span className="font-semibold text-brand-charcoal">Public Curatorship</span> — Feedback is open to all designers. Verified badges are exclusive to clients who completed transaction records.
                    </div>
                  </div>
                )}

                {/* Rating Input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1.5 font-bold">
                    Curation Score (Rating)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewRatingHover(star)}
                        onMouseLeave={() => setReviewRatingHover(null)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (reviewRatingHover ?? reviewRating)
                              ? "fill-brand-terracotta text-brand-terracotta"
                              : "text-brand-warm-gray/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-brand-charcoal/50 ml-2">
                      ({reviewRatingHover ?? reviewRating} / 5)
                    </span>
                  </div>
                </div>

                {/* Grid of Names */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Curator Handle */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1 font-bold">
                      Curator Handle
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-[#FAF9F6]"
                    />
                  </div>

                  {/* Companion Name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1 font-bold">
                      Companion Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Max"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-[#FAF9F6]"
                    />
                  </div>
                </div>

                {/* Companion Breed */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1 font-bold">
                    Companion Breed / Species
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weimaraner (or 'Persian Cat')"
                    value={compBreed}
                    onChange={(e) => setCompBreed(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-[#FAF9F6]"
                  />
                </div>

                {/* Testimonial Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1 font-bold">
                    Testimonial Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Absolute heaven for my companion"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-[#FAF9F6]"
                  />
                </div>

                {/* Testimonial Commentary */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 mb-1 font-bold">
                    Distinguished Commentary
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detail the tactile textures, orthopedic utility, and visual synergy within your design space..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-brand-warm-gray focus:outline-none focus:border-brand-charcoal bg-[#FAF9F6] resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="text-[11px] text-brand-terracotta bg-brand-terracotta/5 border border-brand-terracotta/30 p-2.5 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-charcoal text-white hover:bg-brand-sage transition-all duration-300 py-3 font-mono text-xs uppercase tracking-widest font-bold cursor-pointer"
                >
                  Register Testimonial
                </button>
              </form>
            )}
          </div>

          {/* Column B: Right - Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-brand-charcoal font-bold pb-3 border-b border-brand-warm-gray/60 flex justify-between items-center">
              <span>Refined Client Ledger</span>
              <span className="text-[10px] text-brand-charcoal/50 font-normal">Showing {reviews.length} testimon{reviews.length !== 1 ? "ies" : "y"}</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-brand-warm-gray bg-[#FAF9F6]">
                <MessageSquare className="w-8 h-8 text-brand-warm-gray mx-auto mb-2.5" />
                <p className="text-xs text-brand-charcoal/60 font-mono">No testimonies registered for this creation yet.</p>
                <p className="text-[10px] text-brand-charcoal/40 font-mono mt-1">Be the premier curator to share your experience.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-brand-warm-gray/45 p-5 relative space-y-3"
                  >
                    {/* Stars + Date */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-0.5 text-brand-terracotta">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? "fill-brand-terracotta text-brand-terracotta"
                                : "text-brand-warm-gray/20"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-charcoal/40 font-mono text-[9px]">
                        <Calendar className="w-3 h-3" />
                        <span>{rev.date}</span>
                      </div>
                    </div>

                    {/* Review Title & Verified tag */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-display font-medium text-brand-charcoal">
                          {rev.title}
                        </h4>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-sage/10 border border-brand-sage/30 text-brand-sage font-mono text-[9px] font-bold uppercase tracking-widest leading-none">
                            <UserCheck className="w-2.5 h-2.5" /> Verified Patron
                          </span>
                        )}
                      </div>
                      
                      {/* Author Details */}
                      <p className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider">
                        Curated by <span className="font-bold text-brand-charcoal">{rev.author}</span>
                        {(rev.companionName || rev.companionBreed) && (
                          <>
                            {" "}• Companion:{" "}
                            <span className="font-bold text-brand-charcoal">
                              {rev.companionName || "Companion"}
                              {rev.companionBreed ? ` (${rev.companionBreed})` : ""}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Commentary Text */}
                    <p className="text-xs text-brand-charcoal/85 font-light leading-relaxed whitespace-pre-line border-t border-brand-warm-gray/30 pt-3">
                      {rev.comment}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PAIRS WELL WITH SECTION */}
      <section className="border-t border-brand-warm-gray pt-16">
        <div className="text-center md:text-left mb-10">
          <span className="text-xs font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
            Perfect Companions
          </span>
          <h2 className="text-2xl font-display font-medium text-brand-charcoal">
            Pairs Beautifully With
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.slice(0, 3).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onNavigate("details", prod.id)}
              className="group cursor-pointer flex flex-col bg-white border border-brand-warm-gray/40 p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square w-full bg-brand-oatmeal overflow-hidden mb-4">
                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-display font-medium text-brand-charcoal group-hover:text-brand-terracotta line-clamp-1">
                  {prod.name}
                </h3>
                <span className="font-mono text-xs font-semibold text-brand-charcoal shrink-0 ml-2">
                  ${prod.price.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-brand-charcoal/50 font-mono mb-2">{prod.brand}</p>
              <span className="text-[10px] font-mono uppercase text-brand-terracotta mt-auto tracking-widest block text-right font-medium group-hover:underline">
                View Specifications →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Size Chart Interactive Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="relative w-full max-w-2xl bg-brand-cream border border-brand-warm-gray/80 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] rounded-none z-10 flex flex-col justify-between"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-6 right-6 p-1.5 border border-brand-warm-gray/60 hover:border-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all cursor-pointer"
                title="Close Guide"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="mb-6 space-y-1 pr-8">
                <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase font-bold block">
                  Cultivated Fit Assurance
                </span>
                <h3 className="text-xl md:text-2xl font-display font-semibold text-brand-charcoal">
                  {sizeGuideData.title}
                </h3>
                <p className="text-xs text-brand-charcoal/60 italic font-light">
                  {sizeGuideData.subtitle}
                </p>
              </div>

              {/* Tab Selector Inside Modal */}
              <div className="flex border-b border-brand-warm-gray/60 mb-6 font-mono text-[11px] uppercase tracking-wider overflow-x-auto">
                <button
                  onClick={() => setModalTab("interactive")}
                  className={`pb-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === "interactive"
                      ? "border-brand-terracotta text-brand-terracotta"
                      : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-brand-terracotta" />
                  Interactive Size Helper
                </button>
                <button
                  onClick={() => setModalTab("table")}
                  className={`pb-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    modalTab === "table"
                      ? "border-brand-terracotta text-brand-terracotta"
                      : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
                  }`}
                >
                  Dimensions Table
                </button>
                <button
                  onClick={() => setModalTab("guide")}
                  className={`pb-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    modalTab === "guide"
                      ? "border-brand-terracotta text-brand-terracotta"
                      : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
                  }`}
                >
                  Measuring Tutorial
                </button>
                <button
                  onClick={() => setModalTab("calculator")}
                  className={`pb-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    modalTab === "calculator"
                      ? "border-brand-terracotta text-brand-terracotta"
                      : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
                  }`}
                >
                  Manual Input
                </button>
              </div>

              {/* Modal Content Switcher */}
              <div className="flex-grow min-h-[250px] mb-6">
                {modalTab === "interactive" && (
                  <div className="space-y-6">
                    {/* Description & Weight Unit Switcher */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-brand-oatmeal/40 border border-brand-warm-gray/50 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-brand-terracotta shrink-0" />
                        <span className="text-brand-charcoal font-semibold">Select your companion's weight range to see live fit visual:</span>
                      </div>
                      <div className="flex items-center bg-white border border-brand-warm-gray p-0.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setWeightUnit("lbs")}
                          className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                            weightUnit === "lbs"
                              ? "bg-brand-charcoal text-white"
                              : "text-brand-charcoal/60 hover:text-brand-charcoal"
                          }`}
                        >
                          lbs
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeightUnit("kg")}
                          className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                            weightUnit === "kg"
                              ? "bg-brand-charcoal text-white"
                              : "text-brand-charcoal/60 hover:text-brand-charcoal"
                          }`}
                        >
                          kg
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Weight Range Toggles */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-charcoal/80 block">
                        Toggle Pet Weight Ranges:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          {
                            id: "petite",
                            label: weightUnit === "lbs" ? "Petite (<10 lbs)" : "Petite (<4.5 kg)",
                            sliderVal: weightUnit === "lbs" ? 8 : 4,
                            presetKey: "0-10",
                            sub: "Chihuahua, Cat",
                          },
                          {
                            id: "small",
                            label: weightUnit === "lbs" ? "Small (10-25 lbs)" : "Small (4.5-11.5 kg)",
                            sliderVal: weightUnit === "lbs" ? 18 : 8,
                            presetKey: "10-25",
                            sub: "Frenchie, Pug",
                          },
                          {
                            id: "medium",
                            label: weightUnit === "lbs" ? "Medium (25-50 lbs)" : "Medium (11.5-23 kg)",
                            sliderVal: weightUnit === "lbs" ? 35 : 16,
                            presetKey: "25-50",
                            sub: "Beagle, Corgi",
                          },
                          {
                            id: "large",
                            label: weightUnit === "lbs" ? "Large (50-80 lbs)" : "Large (23-36 kg)",
                            sliderVal: weightUnit === "lbs" ? 65 : 30,
                            presetKey: "50-80",
                            sub: "Retriever, Lab",
                          },
                          {
                            id: "xlarge",
                            label: weightUnit === "lbs" ? "X-Large (80+ lbs)" : "X-Large (36+ kg)",
                            sliderVal: weightUnit === "lbs" ? 95 : 45,
                            presetKey: "80-120",
                            sub: "Great Dane, Mastiff",
                          },
                        ].map((item) => {
                          const isSelected = selectedWeightPreset === item.presetKey;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedWeightPreset(item.presetKey);
                                setCustomWeightSlider(item.sliderVal);
                              }}
                              className={`p-2.5 text-left border font-mono transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? "bg-brand-charcoal text-white border-brand-charcoal ring-1 ring-brand-charcoal"
                                  : "bg-white text-brand-charcoal border-brand-warm-gray hover:border-brand-charcoal"
                              }`}
                            >
                              <span className="text-[11px] font-bold block leading-tight">{item.label}</span>
                              <span className={`text-[9px] block mt-1 ${isSelected ? "text-brand-sand" : "text-brand-charcoal/50"}`}>
                                {item.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Adjustable Continuous Weight Slider */}
                    <div className="p-4 bg-white border border-brand-warm-gray/60 space-y-3 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-brand-terracotta" />
                          Fine-Tune Weight Slider:
                        </span>
                        <span className="font-bold text-brand-terracotta text-sm bg-brand-cream px-2 py-0.5 border border-brand-warm-gray">
                          {customWeightSlider} {weightUnit} {weightUnit === "kg" ? `(~${activeWeightInLbs} lbs)` : ""}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={weightUnit === "lbs" ? 2 : 1}
                        max={weightUnit === "lbs" ? 120 : 55}
                        step={weightUnit === "lbs" ? 1 : 0.5}
                        value={customWeightSlider}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          setCustomWeightSlider(num);
                          if (activeWeightInLbs < 10) setSelectedWeightPreset("0-10");
                          else if (activeWeightInLbs <= 25) setSelectedWeightPreset("10-25");
                          else if (activeWeightInLbs <= 50) setSelectedWeightPreset("25-50");
                          else if (activeWeightInLbs <= 80) setSelectedWeightPreset("50-80");
                          else setSelectedWeightPreset("80-120");
                        }}
                        className="w-full accent-brand-terracotta cursor-pointer"
                      />

                      <div className="flex justify-between text-[10px] text-brand-charcoal/50">
                        <span>{weightUnit === "lbs" ? "2 lbs (Petite)" : "1 kg (Petite)"}</span>
                        <span>{weightUnit === "lbs" ? "50 lbs (Medium)" : "23 kg (Medium)"}</span>
                        <span>{weightUnit === "lbs" ? "120 lbs (Giant)" : "55 kg (Giant)"}</span>
                      </div>
                    </div>

                    {/* Visual Recommendation & Scale Card */}
                    <div className="p-5 bg-white border-2 border-brand-terracotta/40 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-warm-gray/40 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-brand-terracotta text-white rounded-none">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono tracking-widest text-brand-terracotta uppercase font-bold block">
                              Optimal Visual Recommendation
                            </span>
                            <h4 className="text-base font-display font-bold text-brand-charcoal">
                              Recommended Size: <span className="text-brand-terracotta font-extrabold underline">{activeRecommendation.recommendedSize}</span>
                            </h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                          {activeRecommendation.fitBadge}
                        </span>
                      </div>

                      {/* Visual Scale Progress Indicator */}
                      <div className="space-y-1.5 font-mono">
                        <div className="flex justify-between text-[10px] font-bold text-brand-charcoal/70">
                          <span>Companion Sizing Spectrum</span>
                          <span>{activeRecommendation.categoryName}</span>
                        </div>
                        <div className="w-full bg-brand-warm-gray/30 h-3 border border-brand-warm-gray/60 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activeRecommendation.visualScalePercent}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-brand-sage via-brand-terracotta to-amber-600"
                          />
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs bg-brand-cream/30 p-3.5 border border-brand-warm-gray/30">
                        <div>
                          <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-wider block font-bold">
                            Dimensions & Spec:
                          </span>
                          <span className="font-bold text-brand-charcoal">{activeRecommendation.dimensions}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-wider block font-bold">
                            Max Weight Limit:
                          </span>
                          <span className="font-bold text-brand-charcoal">{activeRecommendation.weightCapacity}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-wider block font-bold">
                            Target Companion Breeds:
                          </span>
                          <span className="text-brand-charcoal/80 italic">{activeRecommendation.breeds}</span>
                        </div>
                      </div>

                      {/* Reasoning Note */}
                      <p className="text-xs font-sans text-brand-charcoal/80 leading-relaxed font-light italic border-l-2 border-brand-terracotta pl-3">
                        "{activeRecommendation.reasoning}"
                      </p>

                      {/* Apply Recommended Size CTA */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        {sizeAppliedMsg ? (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{sizeAppliedMsg}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-brand-charcoal/60 italic">
                            Matches selected weight: {customWeightSlider} {weightUnit}
                          </div>
                        )}

                        {product.sizes?.includes(activeRecommendation.recommendedSize) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSize(activeRecommendation.recommendedSize);
                              setSizeAppliedMsg(`Applied size "${activeRecommendation.recommendedSize}" to product selection!`);
                              setTimeout(() => {
                                setSizeAppliedMsg(null);
                                setIsSizeChartOpen(false);
                              }, 1200);
                            }}
                            className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-sage text-xs font-mono uppercase tracking-widest transition-all font-bold cursor-pointer flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Apply Size ({activeRecommendation.recommendedSize}) to Product</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "table" && (
                  <div className="overflow-x-auto border border-brand-warm-gray/40">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-charcoal text-white font-mono uppercase tracking-wider text-[10px]">
                          {sizeGuideData.columns.map((col) => (
                            <th key={col} className="p-3 font-semibold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-warm-gray/40">
                        {sizeGuideData.rows.map((row, index) => (
                          <tr
                            key={index}
                            className={`transition-colors hover:bg-white/60 ${
                              selectedSize.toLowerCase().includes(row.size.toLowerCase())
                                ? "bg-brand-terracotta/5 font-medium"
                                : index % 2 === 0 ? "bg-white/20" : "bg-transparent"
                            }`}
                          >
                            <td className="p-3 font-semibold text-brand-terracotta">
                              {row.size}
                              {selectedSize.toLowerCase().includes(row.size.toLowerCase()) && (
                                <span className="ml-1.5 text-[9px] font-mono bg-brand-terracotta/10 text-brand-terracotta px-1.5 py-0.5 rounded-sm uppercase font-bold">
                                  Your Choice
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-brand-charcoal/80">{row.specs}</td>
                            <td className="p-3 text-brand-charcoal/80 font-mono">{row.weightRange}</td>
                            <td className="p-3 text-brand-charcoal/60 leading-normal">{row.breeds}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {modalTab === "guide" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-brand-charcoal/80">
                        <Ruler className="w-4 h-4 text-brand-terracotta" />
                        <h4 className="font-mono text-xs uppercase tracking-wider font-bold">
                          Step-by-Step Measurement Steps
                        </h4>
                      </div>
                      <ol className="space-y-3.5 list-decimal list-inside text-xs text-brand-charcoal/80 leading-relaxed font-light">
                        {sizeGuideData.steps.map((step, idx) => {
                          const parts = step.split(":");
                          return (
                            <li key={idx} className="marker:text-brand-terracotta marker:font-bold pl-1">
                              {parts.length > 1 ? (
                                <>
                                  <strong className="text-brand-charcoal font-semibold">{parts[0]}:</strong>
                                  {parts.slice(1).join(":")}
                                </>
                              ) : (
                                step
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    <div className="p-4 bg-white border border-brand-warm-gray/60 space-y-2">
                      <div className="flex items-center gap-2 text-brand-sage font-mono text-xs uppercase tracking-wider font-bold">
                        <Info className="w-3.5 h-3.5 text-brand-sage" />
                        <span>Curator's Fit Recommendation</span>
                      </div>
                      <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light italic">
                        "{sizeGuideData.tips[0]}"
                      </p>
                    </div>
                  </div>
                )}

                {modalTab === "calculator" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-wider text-brand-charcoal/80 font-semibold">
                        {sizeGuideData.helperLabel}
                      </label>
                      <div className="flex gap-2 max-w-md">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            value={calcInput}
                            onChange={(e) => setCalcInput(e.target.value)}
                            placeholder={sizeGuideData.helperPlaceholder}
                            className="w-full bg-white border border-brand-warm-gray text-xs font-mono p-3 focus:outline-none focus:border-brand-terracotta rounded-none text-brand-charcoal placeholder:text-brand-charcoal/30"
                          />
                          {sizeGuideData.helperUnit && (
                            <span className="absolute right-3 top-3 text-[10px] font-mono text-brand-charcoal/40 uppercase font-semibold">
                              {sizeGuideData.helperUnit}
                            </span>
                          )}
                        </div>
                        {calcInput && (
                          <button
                            type="button"
                            onClick={() => setCalcInput("")}
                            className="px-3 border border-brand-warm-gray text-brand-charcoal/50 hover:text-brand-charcoal text-xs hover:bg-white font-mono rounded-none"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Result Card */}
                    {calcInput.trim() ? (
                      (() => {
                        const numericVal = parseFloat(calcInput);
                        const resultVal = isNaN(numericVal) && sizeGuideData.type !== "neckwear"
                          ? { size: "", reason: "Please enter a valid positive numerical measurement." }
                          : sizeGuideData.type === "neckwear" && isNaN(numericVal)
                            ? (sizeGuideData.calculate as any)(calcInput)
                            : (sizeGuideData.calculate as any)(numericVal);

                        if (!resultVal.size) {
                          return (
                            <div className="p-4 bg-brand-terracotta/5 border border-brand-terracotta/25 text-brand-terracotta text-xs font-mono">
                              {resultVal.reason}
                            </div>
                          );
                        }

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-white border border-brand-warm-gray/60 shadow-xs space-y-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 bg-brand-sage text-white rounded-full">
                                <Check className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono tracking-widest text-brand-charcoal/50 uppercase block">
                                  Perfect Match
                                </span>
                                <h4 className="text-sm font-mono font-bold text-brand-charcoal">
                                  Recommended Size: <span className="text-brand-terracotta underline font-extrabold">{resultVal.size}</span>
                                </h4>
                              </div>
                            </div>
                            <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light pl-7.5">
                              {resultVal.reason}
                            </p>
                            
                            {/* Option to automatically select this size */}
                            {product.sizes?.includes(resultVal.size) && (
                              <div className="pt-2 pl-7.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSize(resultVal.size);
                                    setIsSizeChartOpen(false);
                                  }}
                                  className="px-3.5 py-2 bg-brand-charcoal text-white hover:bg-brand-sage text-[10px] font-mono uppercase tracking-widest transition-colors font-bold cursor-pointer"
                                >
                                  Apply Recommended Size
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })()
                    ) : (
                      <div className="p-6 border border-dashed border-brand-warm-gray bg-white/40 text-center space-y-1.5">
                        <Calculator className="w-5 h-5 text-brand-charcoal/30 mx-auto" />
                        <p className="text-xs text-brand-charcoal/50 font-light italic">
                          Input your companion's parameters to trigger our dynamic sizing matrix.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-brand-warm-gray/60 pt-4 flex items-center justify-between text-[10px] font-mono text-brand-charcoal/50">
                <span>Selected: {product.name}</span>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(false)}
                  className="px-4 py-2 bg-brand-charcoal text-white text-[10px] uppercase font-bold tracking-wider hover:bg-brand-sage transition-colors rounded-none cursor-pointer"
                >
                  Understood
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
