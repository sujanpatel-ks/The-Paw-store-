/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: "dogs" | "cats" | "eco-friendly" | "essentials";
  secondaryImages?: string[];
  sizes?: string[];
  colors?: { name: string; value: string; image?: string }[];
  tags: string[];
  brand: string;
  inStock?: boolean;
}

export interface StockNotification {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  email: string;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique for item + size + color combination
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; value: string };
  giftNote?: string;
  inventoryId?: string;
  storeId?: string;
  storeName?: string;
  stockQuantity?: number;
}

export interface Order {
  id: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing" | "Cancelled";
  items: { name: string; quantity: number; price: number }[];
  total: number;
  image: string;
}

export interface PetProfile {
  id: string;
  name: string;
  type: "dog" | "cat";
  breed: string;
  age: string;
  weight: string;
  image: string;
  bio: string;
  recommendations: string[];
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "cloud-bed",
    name: "Cloud Orthopedic Bed",
    brand: "Wild One",
    description: "Multi-layered orthotic memory foam with a breathable, furniture-grade outer cover. Engineered for joint support, skeletal alignment, and ultimate comforting pressure relief. Designed to complement any modern interior with premium textured canvas.",
    price: 189.00,
    rating: 4.9,
    reviewsCount: 124,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4UWo_Uczr26zGBcLplnJVb1FXC_4WkQFqZ14kLKIZT40izL8crtfjXOrrI9D-7Cna4_LG1rV9kUCvx4hq1WLTzlV3jcqKYvF7Gjxc-P5-_mJVwibRfxltrkZUmvcFVT1lre6xyAddiLsAgTm71AUDrHOGs2t4mj9-7wByWZggZznxdsE7e8q6kZOlqIOnXXIx2DTu-yqQ6phJSiB0DE9RCLJDLVhs2wPvFzp_vP_-ku74l99_7g",
    category: "dogs",
    secondaryImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU-5xPRll6CYCVQ4_H6Wp5ONTCYEE7CT4l093auRJbh-gsmZgbUL6LzlQbCdMkhwlpFZMTcLkmsmU4s8Ja1H2KRq2e-IJLoQqEPx_TAUqMaa2EyShF9ffh8oT_0reuKr1f6A07aUrH76b3Er3b7i4aLMJXmZ7zgaL86rBh033h-ywFEwVH1cB_2Z3fVga2cfBn5o7yYOGwU9wadCD9uFXSodfFxq8-4YVkwd7NxlcrwkP-p-wz5g",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1q8Uw_cpig1LFZKYdNr7WhIv7bLmJ0PLf7u5Ke8yxK9nNi7XlmDGOTQ1O92XELazJ4nrHS3WfzJQFq3_RidwGci32CJaFJVWceQ3W_Z-cYpueCQwz25rwou8Xk1vKvsGvEF33yDS9MPqYA7DFUUYnoO6sh2w3hZBTtdZ2Bynxy6SM2obhL0i3xZFkLjNmBvhErBrQAPteYqdbFCXhphn4CiXKFrwQVnqbMaJfCGk3nas0ZewXpA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Chl5_EIfX3FkbokCw4e_b_g76BYXE2IWNjt_ZjV-vuraan7-j6fg0r7njenuxSjnbkchlW5uQa_BZsxd0JJXLPv551V-qAleh5oyYHJ4Tivx_Ij_nTAkp1p4neUYSXEp1wTRleSlB5jDWX_5FADi17jf4d9T8CD57DWQZjFqjvB8cQVv3Qb9XVDcAhFDR3E9L_AUH-kmubPvIEyUPIOT3OVWETg5ea2t0QzqTmgCpehtEiiW7A"
    ],
    sizes: ["Small", "Medium", "Large", "X-Large"],
    colors: [
      { name: "Oatmeal Sand", value: "#E5DEC9", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU-5xPRll6CYCVQ4_H6Wp5ONTCYEE7CT4l093auRJbh-gsmZgbUL6LzlQbCdMkhwlpFZMTcLkmsmU4s8Ja1H2KRq2e-IJLoQqEPx_TAUqMaa2EyShF9ffh8oT_0reuKr1f6A07aUrH76b3Er3b7i4aLMJXmZ7zgaL86rBh033h-ywFEwVH1cB_2Z3fVga2cfBn5o7yYOGwU9wadCD9uFXSodfFxq8-4YVkwd7NxlcrwkP-p-wz5g" },
      { name: "Sage Green", value: "#99A98F", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Chl5_EIfX3FkbokCw4e_b_g76BYXE2IWNjt_ZjV-vuraan7-j6fg0r7njenuxSjnbkchlW5uQa_BZsxd0JJXLPv551V-qAleh5oyYHJ4Tivx_Ij_nTAkp1p4neUYSXEp1wTRleSlB5jDWX_5FADi17jf4d9T8CD57DWQZjFqjvB8cQVv3Qb9XVDcAhFDR3E9L_AUH-kmubPvIEyUPIOT3OVWETg5ea2t0QzqTmgCpehtEiiW7A" },
      { name: "Terracotta Sand", value: "#C27664", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1q8Uw_cpig1LFZKYdNr7WhIv7bLmJ0PLf7u5Ke8yxK9nNi7XlmDGOTQ1O92XELazJ4nrHS3WfzJQFq3_RidwGci32CJaFJVWceQ3W_Z-cYpueCQwz25rwou8Xk1vKvsGvEF33yDS9MPqYA7DFUUYnoO6sh2w3hZBTtdZ2Bynxy6SM2obhL0i3xZFkLjNmBvhErBrQAPteYqdbFCXhphn4CiXKFrwQVnqbMaJfCGk3nas0ZewXpA" }
    ],
    tags: ["Orthopedic", "Washable", "Ergonomic"],
  },
  {
    id: "ceramic-bowl",
    name: "Artisan Ceramic Bowl",
    brand: "Aesop Hound",
    description: "Heavyweight stoneware bowl crafted with a minimalist cylindrical profile. Hand-glazed satin finish with a subtle earthy texture and a non-slip weighted silicone base to prevent skidding.",
    price: 48.00,
    rating: 4.8,
    reviewsCount: 89,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn_XNP1_nOtxmy0vbpTFttsTkf7P8ZV0DFuBzrIwgHrC9GKEhMOL3xHMJOe-rY7yJszlbZaOBfVwSIe27WvLqB3nK0W0RFzl6O_nucJsPecxPcq6Iykr5e6xjoFVS2cU0T4F0k2c5U7uO1VHC3pUYk6gPoYs13ra8DM_wumxM9CVHML_M7Y3aIUFmkFtiyuVrPmPGO2Da_IlRXmQN8iwVd_alDVuPOnka3gmZEqkeNaLgcMQoUeQ",
    category: "essentials",
    secondaryImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAirdb815fqoUdsaTNdwqHM0yHDX0QTWe0JeUhVT0vfYWxwPsdHAQEat2shYthfRUfIR0Cwky3UHWZqwCJG1keYW5PccH27CuWY41ZA2G-5xeO863RSZqF7sKdXjU6DPmLfsCvgLH_4odkwycIyxdm9WlP_eH0zKjuZIvobeWATWCRIXmTEOmOOPqTP5HAhtAgYtQ9jpN94GRkU0-orDoNP-TfoRIrkDvfR11x1iEWTBOYw_ZVOAQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCP1khzi8NKCL_efiEnKWpe39xmJNjbHqBwW7GtCUvuwcnCb4Fvgp1nz-4FMkQeO1bUxtGGTzJTtq40JBSwGcRIHiw8x71OeD1bsX7J5HO_kPjiGdEaBy8yV5GkRrOLbc1xTqvY3Se-gArYIcSoM9zmlKRZMDxLDWt6ZB6qc16u0kimOYF1XmDayNWw2gFx9IlFue6nit7kUr1Lmimiu1sSCq26WnAc3D0RNHm8dKSmEu4r7U11Ow"
    ],
    sizes: ["Small (400ml)", "Medium (800ml)", "Large (1.6L)"],
    colors: [
      { name: "Sage Green", value: "#99A98F" },
      { name: "Terracotta Sand", value: "#C27664" },
      { name: "Oatmeal Sand", value: "#E5DEC9" }
    ],
    tags: ["Ceramic", "Dishwasher Safe", "Weighted"],
  },
  {
    id: "woven-leather-leash",
    name: "Woven Leather Leash",
    brand: "Wild One",
    description: "Double-braided full-grain Italian leather, crafted by third-generation Tuscan leather workers. Hand-painted edges with solid, premium brass hardware that develops a stunning vintage patina over time.",
    price: 74.00,
    rating: 4.7,
    reviewsCount: 56,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDelfwFJbQwzNiY3sxuVFgYLdkDU2APY2Hj0vnrnjDleUwr3hS8VguFG-WESJ_riOYTvAvjuOFwKJyBrnUxdJzf0qhKOVJSfhnQXuMo_Zup89zEbkdtl8BwJaSOXvhIpmlWmxzhnS6sgZY8lb2jRHJfwJdFXloSWr05SDAtidKucFxhLmi0dW3J55osie2yxLlbWMfaLiSnuI26PpTv_lji8vMi-r9FGzobPKeP_152vhl4L_QYDA",
    category: "essentials",
    sizes: ["Standard (4ft)", "Long (6ft)"],
    colors: [
      { name: "Terracotta Sand", value: "#C27664" },
      { name: "Charcoal Gray", value: "#3F4E4F" }
    ],
    tags: ["Italian Leather", "Handcrafted", "Solid Brass"],
  },
  {
    id: "premium-velvet-bed",
    name: "Premium Velvet Dog Bed",
    brand: "Aesop Hound",
    description: "Indulgently soft, furniture-grade sapphire velvet orthopedic cushion. Resilient core with responsive contours. Double zippered cover for effortless washing, detailed with minimalist contrasting ivory piping.",
    price: 220.00,
    rating: 5.0,
    reviewsCount: 42,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF-EH3HoqXIkYrzhOG6ZpwvJ4hoAO7EgGpKmECJbalfalka5zXWoJKq0T6CAk4qFSvnCxS7EOXZR46GWeguf0t40mpVZUOSULWvG6h1EOiuawPqjAxLyyqo4WG_7czZFq2btlP4JM0FYOt-B8cPa42o46Rs6WYVfvyUm32CL8TlgJOVpAQJSfIMlqz2eI6zxrko1PlmSpPIxhi-3svbpwvqgpR5MiNETt4WOtprGDJKCYc1UTzfA",
    category: "dogs",
    sizes: ["Medium", "Large", "X-Large"],
    colors: [
      { name: "Sapphire Velvet", value: "#1A365D" }
    ],
    tags: ["Luxury Velvet", "Memory Foam", "Piped Edge"],
  },
  {
    id: "artisanal-treats",
    name: "Artisanal Treats Bundle",
    brand: "The Paws Store",
    description: "Curated variety pack of artisanal oven-baked organic treats. Formulated with nutrient-dense ancient grains, cold-pressed pumpkin, and wild-caught Pacific salmon. Naturally preserved without artificial additives.",
    price: 35.00,
    rating: 4.9,
    reviewsCount: 165,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGc9AAH0qMy2fkeLo4jM0zLDv6fnOYzSzfRg_RgWK7PUHpGiULBWqERLL4paXDCYpIa_zjhYlIWiP7xIuhcR7cHQePyGBEar7XOlVhRLSoXuZW6YSuala9jYoFvTQ7Xw4VvG6hQlYHX_7rHzXGQnxr84S9-Kiy2Q_cQ-ga9lDCTuVFLSAt7d6bOZWAaZot3UaRXa4IacfAkpLoyYJARJsy8SkUAPB98QfklUbgK1809lDg5Y-JVw",
    category: "eco-friendly",
    tags: ["Organic", "Grain-Free", "Salmon & Pumpkin"],
  },
  {
    id: "sustainable-hemp-leash",
    name: "Sustainable Hemp Leash",
    brand: "Eco-Pet Co",
    description: "All-natural, pure organic hemp fiber leash with anti-microbial and mold-resistant traits. Lightweight yet exceptionally strong tensile integrity, paired with high-polish nickel hardware.",
    price: 45.00,
    rating: 4.6,
    reviewsCount: 74,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCN6cGy_cFhY6UXyLWm1rtABgsR9UyuTP8k97bn_wtVbrqEIH6Y-kQLv82LQEkeIiwSUGFve20keTrfS5O2cp_fEKHGiXgImKtOmaicJ7RMTxAJ2HI-YAPXIa7YEbW6ABYk72iKk6xxbzVBZMnc3TFp5LIPiNR1iHJF1VjS_Jev_XS-UzXmHUEbtltt2T4BptpA91q3sUenDwLbNtCl1vAlHeEeGiLrUTERMTwoXzQ1jReU2mwk6A",
    category: "eco-friendly",
    sizes: ["Standard (5ft)"],
    colors: [
      { name: "Natural Oatmeal", value: "#D9D2C9" },
      { name: "Sage Green", value: "#99A98F" }
    ],
    tags: ["Hemp Fiber", "Biodegradable", "Anti-microbial"],
    inStock: false,
  },
  {
    id: "leather-collar",
    name: "Luxury Leather Collar",
    brand: "Wild One",
    description: "Classic matching custom-tanned saddle leather collar with soft velvet backing. Solid brass buckled safety clasp with heavy stitching.",
    price: 52.00,
    rating: 4.8,
    reviewsCount: 31,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGLE0WfsJTKcKM3uAcYZOt8_pWiknFKqKyhOG1BzKQrVXSRCXrIXWvPTzhk81af9mkG41KZpX8CW84FWFtAriaNhzXNJtGwhuDZQ2OX-wUJL91CQ6F5I2C1AOXULFyZ6H348mrRpOisn6cbuksTBbFA1dKQw3bAUjPszQWEeFXD6V6c0WlYVtdY4kaGPOetmUg7COirIy-MQR_hC8GxSVUFZFzvIuuYTSIDXOiamvSkvKQhvsO7w",
    category: "essentials",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Terracotta Sand", value: "#C27664" },
      { name: "Oatmeal Sand", value: "#E5DEC9" }
    ],
    tags: ["Hand-crafted", "Waterproof Backing"],
  },
  {
    id: "organic-cat-scratcher",
    name: "Architectural Cat Scratching Pillar",
    brand: "The Paws Store",
    description: "Stately architectural cat scratching scratching pillar wrapped with organic hand-woven sisal. Sanded solid birch frame that holds up to rigorous activity with aesthetic grace.",
    price: 135.00,
    rating: 4.9,
    reviewsCount: 52,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDibugVNyDUxXk1MOp4ptZTx1gT5En2aPzr08oAZAfejPKZi82NxYqW07WAHxiElq3yhahvehLXjG4cNFM19xYVZG6sBDaA3LwgnycWKg8HD4uy1F7YY8cZFmpgJMQ1rtd4WsGu2o9Uvqk_Q4NbCvlrqOH8FLaSdrEuLPuK_PaKbbDGIlGhpzX-T96niS6aQA0wOn9ZXfCpRgC5ZXIC2sQ5DJZaYtEY7LawkyttR4aNjbtWDmRoGg",
    category: "cats",
    sizes: ["Tall (32\")"],
    colors: [
      { name: "Birch & Cream", value: "#F4EAE1" }
    ],
    tags: ["Sisal Rope", "Heavy Birch Base", "Aesthetic"],
  },
  {
    id: "merino-wool-nest",
    name: "Feline Merino Wool Nest",
    brand: "The Paws Store",
    description: "A hand-felted organic Merino wool pod that provides natural warmth, noise-dampening insulation, and a secure sanctuary. Formulated in a clean, minimalist pebble-dome silhouette.",
    price: 95.00,
    rating: 4.9,
    reviewsCount: 38,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    category: "cats",
    sizes: ["Standard (18\" Diameter)"],
    colors: [
      { name: "Oatmeal Sand", value: "#E5DEC9" },
      { name: "Charcoal Gray", value: "#3F4E4F" }
    ],
    tags: ["Merino Wool", "Hand-Felted", "Thermal Nest"],
    inStock: false,
  },
  {
    id: "ceramic-cat-fountain",
    name: "Stoneware Pet Fountain",
    brand: "Aesop Hound",
    description: "Whisper-quiet continuous flow water fountain fashioned from high-fired, hand-glazed Japanese ceramic. Promotes optimal hydration through natural oxygenation while acting as a living sculptural water feature.",
    price: 110.00,
    rating: 4.8,
    reviewsCount: 44,
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
    category: "cats",
    sizes: ["Standard (1.2L)"],
    colors: [
      { name: "Sage Green", value: "#99A98F" },
      { name: "Oatmeal Sand", value: "#E5DEC9" }
    ],
    tags: ["Stoneware", "Continuous Flow", "Oxygenating"],
  },
  {
    id: "walnut-cat-hammock",
    name: "Minimalist Walnut Cat Hammock",
    brand: "The Paws Store",
    description: "An elegant elevated lounge engineered with architectural American walnut and durable double-layered organic linen. Floating design gives feline companions a secure vantage point without occupying floor space.",
    price: 145.00,
    rating: 5.0,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    category: "cats",
    sizes: ["Standard (22\" x 14\" x 8\")"],
    colors: [
      { name: "American Walnut & Ivory Linen", value: "#F4EAE1" }
    ],
    tags: ["American Walnut", "Linen Hammock", "Elevated Lounge"],
  },
  {
    id: "catnip-teaser-wand",
    name: "Organic Catnip Teaser Wand",
    brand: "Wild One",
    description: "A high-sensory teaser wand crafted from solid walnut wood, raw silk tassels, and a hand-stitched organic hemp pouch packed with ultra-potent heirloom Oregon catnip. Elevates feline play to an art form.",
    price: 32.00,
    rating: 4.7,
    reviewsCount: 67,
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    category: "cats",
    sizes: ["Standard (36\" Wand)"],
    colors: [
      { name: "Terracotta Tassels", value: "#C27664" },
      { name: "Sage Tassels", value: "#99A98F" }
    ],
    tags: ["Oregon Catnip", "Raw Silk", "Walnut Wand"],
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-98421",
    date: "May 14, 2026",
    status: "Delivered",
    items: [
      { name: "Premium Velvet Dog Bed", quantity: 1, price: 220.00 },
      { name: "Artisanal Treats Bundle", quantity: 1, price: 35.00 }
    ],
    total: 255.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF-EH3HoqXIkYrzhOG6ZpwvJ4hoAO7EgGpKmECJbalfalka5zXWoJKq0T6CAk4qFSvnCxS7EOXZR46GWeguf0t40mpVZUOSULWvG6h1EOiuawPqjAxLyyqo4WG_7czZFq2btlP4JM0FYOt-B8cPa42o46Rs6WYVfvyUm32CL8TlgJOVpAQJSfIMlqz2eI6zxrko1PlmSpPIxhi-3svbpwvqgpR5MiNETt4WOtprGDJKCYc1UTzfA"
  },
  {
    id: "ORD-97305",
    date: "April 02, 2026",
    status: "Delivered",
    items: [
      { name: "Artisan Ceramic Bowl (Sage)", quantity: 2, price: 48.00 }
    ],
    total: 96.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn_XNP1_nOtxmy0vbpTFttsTkf7P8ZV0DFuBzrIwgHrC9GKEhMOL3xHMJOe-rY7yJszlbZaOBfVwSIe27WvLqB3nK0W0RFzl6O_nucJsPecxPcq6Iykr5e6xjoFVS2cU0T4F0k2c5U7uO1VHC3pUYk6gPoYs13ra8DM_wumxM9CVHML_M7Y3aIUFmkFtiyuVrPmPGO2Da_IlRXmQN8iwVd_alDVuPOnka3gmZEqkeNaLgcMQoUeQ"
  },
  {
    id: "ORD-96112",
    date: "March 18, 2026",
    status: "Delivered",
    items: [
      { name: "Woven Leather Leash (Terracotta)", quantity: 1, price: 74.00 }
    ],
    total: 74.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDelfwFJbQwzNiY3sxuVFgYLdkDU2APY2Hj0vnrnjDleUwr3hS8VguFG-WESJ_riOYTvAvjuOFwKJyBrnUxdJzf0qhKOVJSfhnQXuMo_Zup89zEbkdtl8BwJaSOXvhIpmlWmxzhnS6sgZY8lb2jRHJfwJdFXloSWr05SDAtidKucFxhLmi0dW3J55osie2yxLlbWMfaLiSnuI26PpTv_lji8vMi-r9FGzobPKeP_152vhl4L_QYDA"
  }
];

export const MOCK_PETS: PetProfile[] = [
  {
    id: "max-dog",
    name: "Max",
    type: "dog",
    breed: "Weimaraner",
    age: "2 years",
    weight: "72 lbs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJCaAWO2gwEb4TY_INlmQenI7CdR7zXJ75NHGvQc2VCaDMEiTD3YZRzPgDV8gXu09YQO2wdxk3aspmqrhMWywPYCevA8vGZi-D1nhzMzZHLHYDHLK5UjB_zycoWmXDJV8Fr0Vj7304XbPQt8KXXwdPyMtfE8P-IVaINpqR_GV1CfYOlmzdE7nLoPA_GdbFkOm1iy-NQco2ifh-cr2Q5_LWrd-n-ziTjMT1DK5ADZFO8Gd_Hor4Ew",
    bio: "An energetic champion who loves woodland runs, dynamic fetch, and resting on extra-deep supportive orthopedic cushioning.",
    recommendations: ["Cloud Orthopedic Bed (Large)", "Artisanal Treats Bundle", "Luxury Leather Collar"]
  },
  {
    id: "luna-cat",
    name: "Luna",
    type: "cat",
    breed: "Persian Cat",
    age: "1 year",
    weight: "8.5 lbs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDibugVNyDUxXk1MOp4ptZTx1gT5En2aPzr08oAZAfejPKZi82NxYqW07WAHxiElq3yhahvehLXjG4cNFM19xYVZG6sBDaA3LwgnycWKg8HD4uy1F7YY8cZFmpgJMQ1rtd4WsGu2o9Uvqk_Q4NbCvlrqOH8FLaSdrEuLPuK_PaKbbDGIlGhpzX-T96niS6aQA0wOn9ZXfCpRgC5ZXIC2sQ5DJZaYtEY7LawkyttR4aNjbtWDmRoGg",
    bio: "A gentle soul who appreciates quiet window views, textured scratching pillars, and small portion stoneware ceramic dishes.",
    recommendations: ["Architectural Cat Scratching Pillar", "Artisan Ceramic Bowl (Small)", "Cozy Cotton Knit Throw"]
  }
];

export const PartnerApplyInputSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  taxId: z.string().optional().nullable(),
});

export type PartnerApplyInput = z.infer<typeof PartnerApplyInputSchema>;

export const AdminApprovalActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional().nullable(),
});

export type AdminApprovalAction = z.infer<typeof AdminApprovalActionSchema>;

export const AiTagResponseSchema = z.object({
  productName: z.string().min(1),
  brand: z.string().min(1),
  category: z.enum(["dogs", "cats", "eco-friendly", "essentials"]),
  weightLbs: z.number().nullable(),
  color: z.string().nullable(),
  petType: z.enum(["dog", "cat", "both"]),
});

export type AiTagResponse = z.infer<typeof AiTagResponseSchema>;

export const InventoryCreateInputSchema = z.object({
  productName: z.string().min(1),
  brand: z.string().min(1),
  category: z.enum(["dogs", "cats", "eco-friendly", "essentials"]),
  weightLbs: z.number().nullable().optional(),
  localPrice: z.number().positive(),
  stockQuantity: z.number().int().nonnegative(),
  shelfImageUrl: z.string().nullable().optional(),
  cloudinaryPublicId: z.string().nullable().optional(),
});

export type InventoryCreateInput = z.infer<typeof InventoryCreateInputSchema>;
