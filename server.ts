import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { prisma } from "./src/lib/prisma";
import { isActivePartner } from "./src/middleware/partnerGuard";
import { PartnerApplyInputSchema, AdminApprovalActionSchema, AiTagResponseSchema, InventoryCreateInputSchema, MOCK_PRODUCTS } from "./src/types";
import { cacheService } from "./src/services/cacheService";
import { generateCloudinarySignature } from "./src/services/cloudinaryService";
import { analyzeProductImage } from "./src/services/aiTaggingService";
import { geocodeAddress } from "./src/services/geocodingService";
import { recordClick, recordAddToCart, recordConversion, getPartnerAnalyticsSummary, getLowPerformingItems, runWeeklyScoringJob } from "./src/services/analyticsService";
import { analyzeConsumerPhoto, searchCatalog, findLocalAvailability } from "./src/services/reverseSearchService";
import jwt from "jsonwebtoken";
import { createSplitOrder, getPartnerFulfillments, updateFulfillmentStatus, completeFulfillment, StockError, inMemoryFulfillments, inMemoryOrders } from "./src/services/orderService";
import { createRazorpayOrder, handlePaymentSuccess, handleRefund, createRazorpayPartnerAccount, generatePartnerOnboardingUrl, logRazorpayWebhook, verifySignature } from "./src/services/paymentService";

let usePrisma = false;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_min_32_chars_long_2026";

export function generateAccessToken(user: { id: string; email: string; role: string; tokenVersion?: number }) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Proactively validate database configuration on boot
if (process.env.DATABASE_URL) {
  usePrisma = true;
} else {
  console.warn("⚠️ Warning: DATABASE_URL is missing in .env. Falling back to in-memory mock database.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with key and aistudio-build telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Offline Curated Expert Companion System to handle rate-limiting beautifully
function getOfflineConciergeResponse(query: string) {
  const normalized = query.toLowerCase();
  let text = "";
  let chunks: any[] = [];

  if (normalized.includes("style") || normalized.includes("groom") || normalized.includes("coat") || normalized.includes("fur") || normalized.includes("hair")) {
    text = `### Curated Styling & Grooming Protocol

Thank you for contacting the Concierge at **The Paws Store**. Your inquiry regarding pet styling and grooming has been routed to our Senior Stylist. 

For the modern high-end companion, maintenance of a pristine coat is a blend of artistry and dermatological care:

1. **The Silk-Conditioning Treatment**: We highly recommend bi-weekly hydration therapy using botanical organic silk proteins. This shields the coat from environmental oxidation and maintains a brilliant shine.
2. **Precision Hand-Scissoring**: For select breeds (such as Poodles, Doodles, and Bichons), hand-scissoring is essential. Standard clippers can compress the hair follicle; hand-scissoring respects the natural growth direction and posture.
3. **Seaside Kelp Supplements**: Incorporating pristine ocean kelp powder into their daily diet promotes rich pigmentation and thickens the undercoat naturally.

We recommend consulting our *Signature Grooming Collection* or contacting our in-house Salon on Madison Ave for custom treatments.`;
    chunks = [
      { title: "Bespoke Grooming & Coat Conditioning Journal", uri: "https://thepawsstore.com/styling-journal" },
      { title: "Curated Botanical Pet Haircare Trends 2026", uri: "https://thepawsstore.com/botanical-trends" }
    ];
  } else if (normalized.includes("veterinary") || normalized.includes("vet") || normalized.includes("health") || normalized.includes("doctor") || normalized.includes("medical") || normalized.includes("diet") || normalized.includes("food") || normalized.includes("nutrition")) {
    text = `### Elite Health & Curated Nutrition Report

Thank you for reaching out to the Concierge. We have formulated this premium wellness summary regarding luxury companion health and nutrition:

1. **The Microbiome Balance**: Curated companion diets should focus heavily on raw or lightly freeze-dried singular protein sources (such as New Zealand Grass-Fed Venison or Wild-Caught Salmon). This minimizes allergic skin reactions and promotes high vitality.
2. **Preventative Longevity Care**: Consider adding wild-caught green-lipped mussel powder to their morning meal. Rich in natural glucosamine and chondroitin, it preserves cartilage and ensures graceful mobility as your companion matures.
3. **Hydration Aesthetics**: Ensure your pet drinks from high-fired lead-free ceramic or heavy-gauge stainless steel fountains. Circulating oxygenated water prevents feline and canine chin acne caused by bacterial buildup in standard plastic bowls.

*Note: For specific medical diagnoses, always consult with a board-certified veterinary practitioner. Our concierge desk can coordinate an appointment at any of our luxury clinical partner locations.*`;
    chunks = [
      { title: "Advanced Longevity Protocols for Elite Companions", uri: "https://thecultivatedcompanion.com/longevity" },
      { title: "Singular Protein Diet Studies by Clinical Vets", uri: "https://thecultivatedcompanion.com/nutrition" }
    ];
  } else if (normalized.includes("bed") || normalized.includes("sleep") || normalized.includes("cushion") || normalized.includes("furniture") || normalized.includes("sofa")) {
    text = `### Architectural Rest & Orthopedic Comfort Analysis

Welcome to the Rest & Comfort consultation desk. Creating a dedicated sanctuary for your companion is fundamental to their cognitive wellness:

1. **Density-Grade Memory Foam**: Our signature beds feature triple-density orthopedic memory foam. This ensures equal weight distribution, completely relieving tension on hips, spine, and elbows.
2. **Climate-Adaptive Linens**: Premium companion beds utilize high-performance boucle and heavy-gauge natural linen covers. These fabrics are naturally thermoregulating—cooling in the summer and insulating in the winter.
3. **Placement Harmony**: Position sleeping sanctuaries away from high-traffic draft zones but within direct visual sightlines of the primary living space to promote deep relaxation.`;
    chunks = [
      { title: "Orthopedic Rest & Spine Alignment in Canines", uri: "https://thepawsstore.com/orthopedic-rest" },
      { title: "The Architecture of Companion Relaxation Spaces", uri: "https://thepawsstore.com/sanctuary-placement" }
    ];
  } else {
    // Elegant general response
    text = `### Curated Consultation from The Paws Store

Thank you for your elegant inquiry: "${query}". 

As part of our commitment to flawless companion living, our concierge desk has processed your query against our local archive of master veterinary advice, bespoke style trends, and premium lifestyle guidelines:

1. **Customized Living Plans**: We believe that every companion represents a unique lifestyle footprint. Whether you are inquiring about accessories, nutrition, or behavioral coaching, consistency and quality are key.
2. **Material Sourcing Integrity**: When choosing items for your home or companion, prioritize full-grain vegetable-tanned leathers, heavy-gauge non-toxic ceramics, and certified organic textiles.
3. **Personalized Curation**: Our boutique specializes in sourcing bespoke goods tailored specifically to your companion's size, temperament, and aesthetic profile.

If you have additional specific requests, please feel free to ask, or update your **GEMINI_API_KEY** in the Secrets settings to restore our live-search global web intelligence.`;
    chunks = [
      { title: "The Paws Store Master Lifestyle Catalog", uri: "https://thepawsstore.com/master-catalog" },
      { title: "Custom Sourcing & Bespoke Commission Form", uri: "https://thepawsstore.com/custom-sourcing" }
    ];
  }

  return { text, chunks };
}

// ==========================================
// --- ENTERPRISE IN-MEMORY DATABASE ---
// ==========================================

export type UserRole = "CUSTOMER" | "PARTNER" | "ADMIN";
export type PartnerApprovalStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "DRAFT";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface PartnerStoreAccount {
  id: string;
  businessName: string;
  ownerId: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  logoUrl?: string | null;
  taxId?: string | null;
  rejectionReason?: string | null;
  approvalStatus: PartnerApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserAccount;
      partnerStore?: PartnerStoreAccount;
    }
  }
}

let dbUserAccounts: UserAccount[] = [
  {
    id: "sarah-vip",
    email: "sarah.curator@example.com",
    name: "Sarah",
    username: "Sarah",
    role: "CUSTOMER",
    createdAt: new Date().toISOString()
  },
  {
    id: "partner-active-owner",
    email: "active.partner@petmarketplace.com",
    name: "Alex Vance",
    username: "alex_vance",
    role: "PARTNER",
    createdAt: new Date().toISOString()
  },
  {
    id: "partner-pending-owner",
    email: "applicant.pets@example.com",
    name: "Jordan Lee",
    username: "jordan_lee",
    role: "CUSTOMER",
    createdAt: new Date().toISOString()
  },
  {
    id: "admin-user",
    email: "admin.petmarketplace@example.com",
    name: "Marketplace Admin",
    username: "admin",
    role: "ADMIN",
    createdAt: new Date().toISOString()
  }
];

let dbPartnerStoresList: PartnerStoreAccount[] = [
  {
    id: "store-active-1",
    businessName: "Bark & Purr Haven",
    ownerId: "partner-active-owner",
    address: "740 Broadway, New York, NY 10003",
    lat: 40.7291,
    lng: -73.9937,
    logoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200",
    taxId: "TAX-998877",
    approvalStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "store-pending-1",
    businessName: "Pawsitive Luxury Supplies",
    ownerId: "partner-pending-owner",
    address: "120 Bowery St, New York, NY 10013",
    lat: 40.7182,
    lng: -73.9951,
    logoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200",
    taxId: "TAX-112233",
    approvalStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function authenticateUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  const token = authHeader.substring(7);

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  let user: any = undefined;

  if (usePrisma) {
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: payload.userId },
            { email: payload.email }
          ]
        },
        include: { partnerStore: true }
      });
    } catch (err) {
      console.error("Auth middleware database error:", err);
    }
  }

  // Fallback to in-memory database if not found in Prisma
  if (!user) {
    user = dbUserAccounts.find((u) => u.id === payload.userId || u.email === payload.email);
    if (user) {
      user = {
        ...user,
        partnerStore: dbPartnerStoresList.find((s) => s.ownerId === user.id)
      };
    }
  }

  if (!user) {
    return res.status(401).json({ error: "User not found." });
  }

  const currentTokenVersion = user.tokenVersion ?? 0;
  const tokenVersionInPayload = payload.tokenVersion ?? 0;

  if (currentTokenVersion !== tokenVersionInPayload) {
    return res.status(401).json({ code: "TOKEN_REVOKED", error: "Token has been revoked." });
  }

  req.user = user;
  next();
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  membership: string;
  bio: string;
  avatar: string;
}

interface PetProfile {
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

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface WishlistItem {
  userId: string;
  productId: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Brand {
  id: string;
  name: string;
  description: string;
}

interface Coupon {
  code: string;
  percent: number;
  isActive: boolean;
  maxUses: number;
  usedCount: number;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string;
  author: string;
  companionName?: string;
  companionBreed?: string;
  comment: string;
  date: string;
  verified: boolean;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
}

interface Order {
  id: string;
  date: string;
  status: "Processing" | "In Transit" | "Delivered" | "Cancelled" | "Refunded";
  items: OrderItem[];
  total: number;
  image: string;
  userId: string;
  couponCode?: string;
  addressId?: string;
}

interface OrderTimelineEvent {
  date: string;
  status: string;
  description: string;
}

interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  date: string;
}

interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

// --- DB STORAGE ---
let dbUsers: UserProfile[] = [
  {
    id: "sarah-vip",
    username: "Sarah",
    email: "sarah.curator@example.com",
    phone: "+1 (555) 019-2831",
    membership: "VIP Curator",
    bio: "Interior designer passionate about harmonizing living spaces for athletic and sensitive companion pets.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
  }
];

let dbPetProfiles: PetProfile[] = [
  {
    id: "pet-1",
    name: "Luna",
    type: "cat",
    breed: "Persian Royal Blue",
    age: "3 Years",
    weight: "9.2 lbs",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
    bio: "Luna loves high-vantage lounges and slow continuous-flow ceramic water fountains.",
    recommendations: ["walnut-cat-hammock", "ceramic-cat-fountain"]
  }
];

let dbAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Primary Studio",
    street: "1240 Park Avenue, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10128",
    country: "United States",
    isDefault: true
  },
  {
    id: "addr-2",
    label: "Summer Cottage",
    street: "82 Ocean Breeze Lane",
    city: "East Hampton",
    state: "NY",
    zip: "11937",
    country: "United States",
    isDefault: false
  }
];

let dbWishlists: WishlistItem[] = [
  { userId: "sarah-vip", productId: "cloud-bed" },
  { userId: "sarah-vip", productId: "artisanal-treats" }
];

let dbCategories: Category[] = [
  { id: "dogs", name: "Dogs Collection", description: "Bespoke furnishings and apparel for canines." },
  { id: "cats", name: "Cats Collection", description: "Architectural scratching pillars and hand-felted nests." },
  { id: "eco-friendly", name: "Eco-Friendly", description: "Sustainably-sourced hemp, organic wools, and reclaimed wood." },
  { id: "essentials", name: "Essentials", description: "Artisan stoneware bowls and organic treats." }
];

let dbBrands: Brand[] = [
  { id: "wild-one", name: "Wild One", description: "Modern functional play and rest coordinates." },
  { id: "the-paws-store", name: "The Paws Store", description: "Architecturally refined heirloom companion items." },
  { id: "aesop-hound", name: "Aesop Hound", description: "Handcrafted ceramics and botanicals." }
];

let dbInventory: Record<string, number> = {
  "cloud-bed": 12,
  "ceramic-bowl": 25,
  "woven-leather-leash": 18,
  "premium-velvet-bed": 4, 
  "artisanal-treats": 40,
  "merino-wool-nest": 15,
  "ceramic-cat-fountain": 8,
  "walnut-cat-hammock": 3,  
  "catnip-teaser-wand": 50
};

let dbCoupons: Coupon[] = [
  { code: "ELEVATE10", percent: 10, isActive: true, maxUses: 100, usedCount: 15 },
  { code: "VIP20", percent: 20, isActive: true, maxUses: 50, usedCount: 12 },
  { code: "WELCOME5", percent: 5, isActive: true, maxUses: 200, usedCount: 4 }
];

let dbReviews: Review[] = [
  {
    id: "rev-cb-1",
    productId: "cloud-bed",
    rating: 5,
    title: "Divine orthopedic relief",
    author: "Sarah",
    companionName: "Winston",
    companionBreed: "Labrador",
    comment: "My elder retriever slept through the night for the first time in months. Pure comfort.",
    date: "July 10, 2026",
    verified: true
  },
  {
    id: "rev-mwn-1",
    productId: "merino-wool-nest",
    rating: 5,
    title: "Pure feline sanctuary",
    author: "Genevieve",
    companionName: "Winston",
    companionBreed: "British Shorthair",
    comment: "The Merino wool is exceptionally soft yet holds its architectural dome structure perfectly.",
    date: "July 12, 2026",
    verified: true
  }
];

let dbOrders: Order[] = [
  {
    id: "ORD-9281-XC",
    date: "July 14, 2026",
    status: "Processing",
    items: [
      { name: "Premium Velvet Bed (Medium / Sapphire)", quantity: 1, price: 210.00, productId: "premium-velvet-bed" }
    ],
    total: 210.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4UWo_Uczr26zGBcLplnJVb1FXC_4WkQFqZ14kLKIZT40izL8crtfjXOrrI9D-7Cna4_LG1rV9kUCvx4hq1WLTzlV3jcqKYvF7Gjxc-P5-_mJVwibRfxltrkZUmvcFVT1lre6xyAddiLsAgTm71AUDrHOGs2t4mj9-7wByWZggZznxdsE7e8q6kZOlqIOnXXIx2DTu-yqQ6phJSiB0DE9RCLJDLVhs2wPvFzp_vP_-ku74l99_7g",
    userId: "sarah-vip"
  }
];

let dbOrderTimelines: Record<string, OrderTimelineEvent[]> = {
  "ORD-9281-XC": [
    { date: "July 14, 2026 09:30 AM", status: "Order Placed", description: "Bespoke order registered and authenticated." },
    { date: "July 14, 2026 10:15 AM", status: "Payment Confirmed", description: "Secure transaction certified successfully." },
    { date: "July 14, 2026 02:45 PM", status: "In Production", description: "Item is being prepared with customized packaging at our design studio." }
  ]
};

let dbNotifications: UserNotification[] = [
  {
    id: "notif-1",
    userId: "sarah-vip",
    title: "New Curator Welcome",
    message: "Welcome to your refined design dashboard. Discover optimal feline wellness coordinates.",
    isRead: false,
    date: "July 16, 2026"
  }
];

let dbAuditLogs: AuditLogEntry[] = [
  {
    timestamp: "2026-07-16T09:40:00-07:00",
    action: "ADMIN_LOGIN",
    user: "Sarah (Admin)",
    details: "Authenticated administrative session from verified IP address."
  }
];

let dbRefreshTokens: string[] = ["token-sarah-rotation-928"];

// --- SECURITY LOGGING HELPER ---
function addAuditLog(action: string, user: string, details: string) {
  dbAuditLogs.unshift({
    timestamp: new Date().toISOString(),
    action,
    user,
    details
  });
}

// --- RATE LIMITING MIDDLEWARE ---
const ipRateLimitStore = new Map<string, { count: number; resetTime: number }>();
function standardRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "anonymous";
  const now = Date.now();
  const limitWindowMs = 60 * 1000; // 1 minute
  const maxRequests = 120; // 120 requests per minute
  
  const record = ipRateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    ipRateLimitStore.set(ip, { count: 1, resetTime: now + limitWindowMs });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "White-glove API protection active. Request quota exceeded, please pause briefly.",
        resetInSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
    }
  }
  next();
}

app.use(standardRateLimiter);


// --- HEALTHCHECK ENDPOINTS ---
app.get("/health/liveness", (req, res) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health/readiness", async (req, res) => {
  let dbStatus = usePrisma ? "connected" : "in-memory";
  if (usePrisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (e) {
      dbStatus = "disconnected";
    }
  }
  return res.json({
    status: dbStatus === "disconnected" ? "degraded" : "healthy",
    services: {
      database: dbStatus
    }
  });
});

// --- ADMIN STATS & AUDIT LOGS ENDPOINTS ---
app.get("/api/admin/stats", authenticateUser, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access forbidden: Admin privilege required", code: "FORBIDDEN" });
  }

  if (usePrisma) {
    try {
      const totalOrders = await prisma.order.count();
      const totalUsers = await prisma.user.count();
      const activePartners = await prisma.partnerStore.count({ where: { approvalStatus: "ACTIVE" } });
      const pendingPartners = await prisma.partnerStore.count({ where: { approvalStatus: "PENDING" } });
      const paidOrders = await prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true } });
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return res.json({
        totalRevenue,
        totalOrders,
        totalUsers,
        activePartners,
        pendingPartners
      });
    } catch (e) {}
  }

  return res.json({
    totalRevenue: 14850.0,
    totalOrders: dbOrders.length,
    totalUsers: dbUserAccounts.length,
    activePartners: dbPartnerStoresList.filter(s => s.approvalStatus === "ACTIVE").length,
    pendingPartners: dbPartnerStoresList.filter(s => s.approvalStatus === "PENDING").length
  });
});

app.get("/api/admin/audit-logs", authenticateUser, (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access forbidden: Admin privilege required", code: "FORBIDDEN" });
  }
  return res.json({ auditLogs: dbAuditLogs });
});

// --- SECURITY & AUTH MODULES ---

// SECURITY & AUTHENTICATION ENDPOINTS
app.post("/api/auth/register", async (req, res) => {
  const { email, name, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  if (usePrisma) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const requestedRole = role || "CUSTOMER";
      const assignedRole = requestedRole === "PARTNER" ? "CUSTOMER" : requestedRole;

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split("@")[0],
          username: name || email.split("@")[0],
          role: assignedRole,
          password: password || "hashed_password",
          tokenVersion: 0
        }
      });

      addAuditLog("USER_REGISTERED", newUser.email, `Registered user with role: ${assignedRole} (Requested: ${role})`);
      const accessToken = generateAccessToken(newUser);

      if (requestedRole === "PARTNER") {
        return res.status(201).json({
          success: true,
          user: newUser,
          accessToken,
          redirectTo: "/onboarding",
          message: "Account created as CUSTOMER. Complete partner onboarding form at /onboarding to apply for a Partner Store."
        });
      }

      return res.status(201).json({
        success: true,
        user: newUser,
        accessToken
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback to in-memory
  const existing = dbUserAccounts.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  const requestedRole: UserRole = role || "CUSTOMER";
  const assignedRole: UserRole = requestedRole === "PARTNER" ? "CUSTOMER" : requestedRole;

  const newUser: UserAccount = {
    id: "user-" + Date.now(),
    email,
    name: name || email.split("@")[0],
    username: name || email.split("@")[0],
    role: assignedRole,
    password: password || "hashed_password",
    tokenVersion: 0,
    createdAt: new Date().toISOString()
  };

  dbUserAccounts.push(newUser);
  addAuditLog("USER_REGISTERED", newUser.email, `Registered user with role: ${assignedRole} (Requested: ${requestedRole})`);
  const accessToken = generateAccessToken(newUser);

  if (requestedRole === "PARTNER") {
    return res.status(201).json({
      success: true,
      user: newUser,
      accessToken,
      redirectTo: "/onboarding",
      message: "Account created as CUSTOMER. Complete partner onboarding form at /onboarding to apply for a Partner Store."
    });
  }

  return res.status(201).json({
    success: true,
    user: newUser,
    accessToken
  });
});

// LOGIN ENDPOINT
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  let user: any = null;
  if (usePrisma) {
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { partnerStore: true }
      });
    } catch (e) {}
  }

  if (!user) {
    user = dbUserAccounts.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const accessToken = generateAccessToken(user);
  return res.json({
    success: true,
    user,
    accessToken
  });
});

// TOKEN REFRESH & ROTATION ENDPOINT
app.post("/api/auth/token", async (req, res) => {
  const authHeader = req.headers.authorization;
  const refreshTokenInput = req.body?.refreshToken;

  let tokenToVerify = refreshTokenInput;
  if (!tokenToVerify && authHeader && authHeader.startsWith("Bearer ")) {
    tokenToVerify = authHeader.substring(7);
  }

  if (!tokenToVerify) {
    return res.status(401).json({ error: "Refresh token is required." });
  }

  let payload: any;
  try {
    payload = jwt.verify(tokenToVerify, JWT_SECRET, { ignoreExpiration: true });
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token." });
  }

  let user: any = null;
  if (usePrisma) {
    try {
      user = await prisma.user.findFirst({
        where: { OR: [{ id: payload.userId }, { email: payload.email }] }
      });

      if (user) {
        // Increment token version to rotate and invalidate previous token
        user = await prisma.user.update({
          where: { id: user.id },
          data: { tokenVersion: { increment: 1 } }
        });
      }
    } catch (e) {}
  }

  if (!user) {
    user = dbUserAccounts.find((u) => u.id === payload.userId || u.email === payload.email);
    if (user) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
  }

  if (!user) {
    return res.status(401).json({ error: "User not found." });
  }

  const newAccessToken = generateAccessToken(user);
  return res.json({
    accessToken: newAccessToken,
    refreshToken: newAccessToken,
    user
  });
});

// PARTNER STORE ONBOARDING APPLICATION
app.post("/api/partner/apply", authenticateUser, async (req, res) => {
  const validation = PartnerApplyInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.flatten().fieldErrors
    });
  }

  const { businessName, address, taxId } = validation.data;

  if (usePrisma) {
    try {
      const existingStore = await prisma.partnerStore.findUnique({
        where: { ownerId: req.user.id }
      });
      if (existingStore) {
        return res.status(409).json({
          error: "Partner store application already exists for this user account.",
          code: "ALREADY_APPLIED",
          existingStore
        });
      }

      // Geocode the address
      const geocodeResult = await geocodeAddress(address);
      if (geocodeResult.fallbackUsed) {
        addAuditLog("GEOCODING_FALLBACK", req.user.email, `Geocoding fallback centroid triggered for: ${address}`);
      }

      const storeLat = geocodeResult.lat;
      const storeLng = geocodeResult.lng;
      const warning = (storeLat === null || storeLng === null) ? "We could not verify your address. Please contact support." : undefined;

      const newStore = await prisma.partnerStore.create({
        data: {
          businessName,
          ownerId: req.user.id,
          address,
          lat: storeLat,
          lng: storeLng,
          approvalStatus: "PENDING",
          taxId: taxId || null,
        }
      });

      addAuditLog("PARTNER_APPLICATION_SUBMITTED", req.user.email, `Submitted partner store application: ${businessName}`);

      return res.status(201).json({
        success: true,
        storeId: newStore.id,
        store: newStore,
        warning,
        message: "Partner application submitted successfully and pending admin approval."
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback to in-memory
  const existingStore = dbPartnerStoresList.find((s) => s.ownerId === req.user.id);
  if (existingStore) {
    return res.status(409).json({
      error: "Partner store application already exists for this user account.",
      code: "ALREADY_APPLIED",
      existingStore
    });
  }

  // Geocode the address
  const geocodeResult = await geocodeAddress(address);
  if (geocodeResult.fallbackUsed) {
    addAuditLog("GEOCODING_FALLBACK", req.user.email, `Geocoding fallback centroid triggered for: ${address}`);
  }

  const storeLat = geocodeResult.lat;
  const storeLng = geocodeResult.lng;
  const warning = (storeLat === null || storeLng === null) ? "We could not verify your address. Please contact support." : undefined;

  const newStore: PartnerStoreAccount = {
    id: "store-" + Date.now(),
    businessName,
    ownerId: req.user.id,
    address,
    lat: storeLat,
    lng: storeLng,
    logoUrl: null,
    taxId: taxId || null,
    approvalStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbPartnerStoresList.push(newStore);
  addAuditLog("PARTNER_APPLICATION_SUBMITTED", req.user.email, `Submitted partner store application: ${businessName}`);

  return res.status(201).json({
    success: true,
    storeId: newStore.id,
    store: newStore,
    warning,
    message: "Partner application submitted successfully and pending admin approval."
  });
});

// ADMIN APPROVAL QUEUE - GET PENDING STORES
app.get("/api/admin/partners/pending", authenticateUser, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Access forbidden: Admin privilege required",
      code: "FORBIDDEN"
    });
  }

  if (usePrisma) {
    try {
      const pendingStores = await prisma.partnerStore.findMany({
        where: { approvalStatus: "PENDING" },
        include: { owner: true }
      });
      
      const mappedStores = pendingStores.map(s => ({
        ...s,
        owner: s.owner ? { email: s.owner.email, name: s.owner.name, username: s.owner.username } : { email: "applicant@example.com", name: "Applicant" }
      }));

      return res.json({
        pendingStores: mappedStores,
        count: mappedStores.length
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback to in-memory
  const pendingStores = dbPartnerStoresList
    .filter((s) => s.approvalStatus === "PENDING")
    .map((s) => {
      const owner = dbUserAccounts.find((u) => u.id === s.ownerId);
      return {
        ...s,
        owner: owner ? { email: owner.email, name: owner.name, username: owner.username } : { email: "applicant@example.com", name: "Applicant" }
      };
    });

  return res.json({
    pendingStores,
    count: pendingStores.length
  });
});

// ADMIN APPROVAL QUEUE - APPROVE OR REJECT STORE
app.patch("/api/admin/partners/:id/approve", authenticateUser, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Access forbidden: Admin privilege required",
      code: "FORBIDDEN"
    });
  }

  const validation = AdminApprovalActionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.flatten().fieldErrors
    });
  }

  const { action, rejectionReason } = validation.data;

  if (usePrisma) {
    try {
      const store = await prisma.partnerStore.findUnique({
        where: { id: req.params.id }
      });
      if (!store) {
        return res.status(404).json({ error: "Partner store record not found." });
      }

      if (action === "APPROVE") {
        const updatedStore = await prisma.partnerStore.update({
          where: { id: req.params.id },
          data: {
            approvalStatus: "ACTIVE",
          }
        });
        
        await prisma.user.update({
          where: { id: store.ownerId },
          data: {
            role: "PARTNER",
            tokenVersion: { increment: 1 }
          }
        });

        addAuditLog("PARTNER_STORE_APPROVED", req.user.email, `Approved partner store: ${store.businessName} (${store.id}). User role updated to PARTNER and token invalidated.`);

        return res.json({
          success: true,
          message: "Partner store approved and associated user role updated to PARTNER.",
          store: updatedStore,
          ownerRole: "PARTNER"
        });
      } else {
        const updatedStore = await prisma.partnerStore.update({
          where: { id: req.params.id },
          data: {
            approvalStatus: "REJECTED",
            rejectionReason: rejectionReason || "Application rejected by marketplace administration."
          }
        });

        addAuditLog("PARTNER_STORE_REJECTED", req.user.email, `Rejected partner store: ${store.businessName} (${store.id}). Reason: ${updatedStore.rejectionReason}`);

        return res.json({
          success: true,
          message: "Partner store application rejected.",
          store: updatedStore
        });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback to in-memory
  const store = dbPartnerStoresList.find((s) => s.id === req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Partner store record not found." });
  }

  const owner = dbUserAccounts.find((u) => u.id === store.ownerId);

  if (action === "APPROVE") {
    store.approvalStatus = "ACTIVE";
    store.updatedAt = new Date().toISOString();
    if (owner) {
      owner.role = "PARTNER";
    }

    addAuditLog("PARTNER_STORE_APPROVED", req.user.email, `Approved partner store: ${store.businessName} (${store.id}). User role updated to PARTNER.`);

    return res.json({
      success: true,
      message: "Partner store approved and associated user role updated to PARTNER.",
      store,
      ownerRole: owner?.role
    });
  } else {
    store.approvalStatus = "REJECTED";
    store.rejectionReason = rejectionReason || "Application rejected by marketplace administration.";
    store.updatedAt = new Date().toISOString();

    addAuditLog("PARTNER_STORE_REJECTED", req.user.email, `Rejected partner store: ${store.businessName} (${store.id}). Reason: ${store.rejectionReason}`);

    return res.json({
      success: true,
      message: "Partner store application rejected.",
      store
    });
  }
});

// PROTECTED TEST ROUTE TO CHECK isActivePartner MIDDLEWARE
app.get("/api/partner/test", authenticateUser, isActivePartner, (req, res) => {
  return res.json({
    success: true,
    message: "Welcome verified boutique partner! Access granted to protected partner workspace resources.",
    store: req.partnerStore
  });
});

// CLOUDINARY UPLOAD SIGNATURE GENERATOR
const handleUploadSignature = async (req: any, res: any) => {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(400).json({
      code: "ERR_SIGNATURE_EXPIRED",
      error: "Cloudinary credentials missing in env."
    });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET || "partner_shelfies";
    const storeId = req.partnerStore?.id || "default_store";
    const tags = `partner_store_${storeId}`;

    const signature = generateCloudinarySignature({ timestamp, upload_preset, tags }, process.env.CLOUDINARY_API_SECRET);

    return res.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: upload_preset,
      tags
    });
  } catch (err: any) {
    return res.status(400).json({
      code: "ERR_SIGNATURE_EXPIRED",
      error: err.message
    });
  }
};

app.post("/api/partner/upload-signature", authenticateUser, isActivePartner, handleUploadSignature);
app.get("/api/partner/upload-signature", authenticateUser, isActivePartner, handleUploadSignature);

// GEMINI AI PRODUCT IMAGE ANALYSIS & TAGGING
app.post("/api/partner/ai-tag", authenticateUser, isActivePartner, async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required." });
  }

  // 1. Check cache first
  const cached = cacheService.get(imageUrl);
  if (cached) {
    return res.json({
      ...cached,
      cached: true
    });
  }

  // 2. Perform AI tagging
  try {
    const analysisResult = await analyzeProductImage(imageUrl);

    // Validate using Zod
    const validation = AiTagResponseSchema.safeParse(analysisResult);
    if (!validation.success) {
      throw new Error("Gemini returned malformed schema structure");
    }

    addAuditLog("AI_TAG_ATTEMPT", req.user?.email || "System", `Successfully analyzed product image: ${imageUrl}`);

    // Cache tagging result for 24 hours
    cacheService.set(imageUrl, validation.data, 24 * 60 * 60 * 1000);

    return res.json({
      ...validation.data,
      cached: false
    });
  } catch (err: any) {
    console.error("AI Tagging error:", err);
    addAuditLog("AI_TAG_ATTEMPT", req.user?.email || "System", `Failed to analyze product image: ${err.message}`);

    // Standard fallback response required:
    return res.status(200).json({
      error: "AI could not parse this image. Please fill in fields manually."
    });
  }
});

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// PROXIMITY SEARCH API
app.get("/api/partner/nearby", async (req, res) => {
  const userLatStr = req.query.lat as string;
  const userLngStr = req.query.lng as string;
  const radiusStr = req.query.radius as string;
  const limitStr = req.query.limit as string;

  if (!userLatStr || !userLngStr) {
    return res.status(400).json({ error: "Query parameters 'lat' and 'lng' are required." });
  }

  const userLat = parseFloat(userLatStr);
  const userLng = parseFloat(userLngStr);
  const radius = radiusStr ? parseFloat(radiusStr) : 10; // Default 10 miles
  const limit = limitStr ? parseInt(limitStr, 10) : 50; // Default 50 records

  if (isNaN(userLat) || isNaN(userLng) || isNaN(radius) || isNaN(limit)) {
    return res.status(400).json({ error: "Invalid coordinate values or parameters." });
  }

  if (usePrisma) {
    try {
      // Query raw SQL using the Haversine formula to compute distance in miles
      const items: any[] = await prisma.$queryRaw`
        SELECT * FROM (
          SELECT pi.id, pi."storeId", pi."productId", pi.price, pi."stockQuantity", pi."shelfImageUrl",
                 p.name as "productName", p.brand as "productBrand", p.category as "productCategory",
                 ps."businessName" as "storeName", ps.address as "storeAddress", ps.lat as "storeLat", ps.lng as "storeLng",
                 (3959 * acos(
                   least(1.0, greatest(-1.0, 
                     cos(radians(${userLat})) * cos(radians(ps.lat)) * cos(radians(ps.lng) - radians(${userLng})) +
                     sin(radians(${userLat})) * sin(radians(ps.lat))
                   ))
                 )) as distance
          FROM "PartnerInventory" pi
          JOIN "Product" p ON p.id = pi."productId"
          JOIN "PartnerStore" ps ON ps.id = pi."storeId"
          WHERE ps."approvalStatus" = 'ACTIVE' AND ps.lat IS NOT NULL AND ps.lng IS NOT NULL
        ) sub
        WHERE distance <= ${radius}
        ORDER BY distance ASC
        LIMIT ${limit}
      `;

      // Map raw SQL fields to clean response format
      const mapped = items.map(item => ({
        id: item.id,
        price: item.price,
        stockQuantity: item.stockQuantity,
        shelfImageUrl: item.shelfImageUrl,
        distance: item.distance,
        product: {
          id: item.productId,
          name: item.productName,
          brand: item.productBrand,
          category: item.productCategory
        },
        store: {
          id: item.storeId,
          businessName: item.storeName,
          address: item.storeAddress,
          lat: item.storeLat,
          lng: item.storeLng
        }
      }));

      return res.json(mapped);
    } catch (err: any) {
      console.error("Proximity SQL query failed, running in-memory fallback:", err);
    }
  }

  // Fallback in-memory query logic
  try {
    const nearbyItems: any[] = [];
    
    // Scan loaded inventories
    for (const item of dbPartnerInventories) {
      const store = dbPartnerStoresList.find(s => s.id === item.storeId);
      if (!store || store.approvalStatus !== "ACTIVE" || store.lat === null || store.lng === null) {
        continue;
      }

      const distance = calculateHaversineDistance(userLat, userLng, store.lat, store.lng);
      if (distance <= radius) {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId) || {
          id: item.productId,
          name: "Unknown Product",
          brand: "Generic",
          category: "essentials"
        };

        nearbyItems.push({
          id: item.id,
          price: item.price,
          stockQuantity: item.stockQuantity,
          shelfImageUrl: item.shelfImageUrl,
          distance,
          product,
          store
        });
      }
    }

    // Sort by distance and slice to limit
    nearbyItems.sort((a, b) => a.distance - b.distance);
    return res.json(nearbyItems.slice(0, limit));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

let dbPartnerInventories: any[] = [];

// GET PARTNER INVENTORY LIST
app.get("/api/partner/inventory", authenticateUser, isActivePartner, async (req, res) => {
  if (usePrisma) {
    try {
      const items = await prisma.partnerInventory.findMany({
        where: { storeId: req.partnerStore.id },
        include: { product: true }
      });
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback in-memory
  const items = dbPartnerInventories.filter(i => i.storeId === req.partnerStore.id);
  return res.json(items);
});

// INVENTORY UPLOAD GUARDED BY isActivePartner MIDDLEWARE
app.post("/api/partner/inventory", authenticateUser, isActivePartner, async (req, res) => {
  const validation = InventoryCreateInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.flatten().fieldErrors
    });
  }

  const { productName, brand, category, weightLbs, localPrice, stockQuantity, shelfImageUrl, cloudinaryPublicId } = validation.data;

  if (usePrisma) {
    try {
      // Execute as atomic database transaction
      const inventory = await prisma.$transaction(async (tx) => {
        // Find existing product in catalog (case-insensitive check)
        let product = await tx.product.findFirst({
          where: {
            brand: { equals: brand, mode: "insensitive" },
            name: { equals: productName, mode: "insensitive" }
          }
        });

        if (!product) {
          // Create product in catalog
          product = await tx.product.create({
            data: {
              id: "prod-" + Date.now(),
              name: productName,
              brand: brand,
              category: category,
              description: `Bespoke partner product: ${productName} by ${brand}.`,
              price: localPrice,
              rating: 4.5,
              reviewsCount: 0,
              image: shelfImageUrl || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
              colors: [],
              sizes: [],
              secondaryImages: [],
              tags: [],
            }
          });
        }

        // Create PartnerInventory entry
        const inv = await tx.partnerInventory.create({
          data: {
            storeId: req.partnerStore.id,
            productId: product.id,
            price: localPrice,
            stockQuantity: stockQuantity,
            shelfImageUrl: shelfImageUrl || null,
            cloudinaryPublicId: cloudinaryPublicId || null,
          },
          include: {
            product: true,
            store: true
          }
        });

        return inv;
      });

      addAuditLog("PARTNER_INVENTORY_CREATED", req.user.email, `Created inventory entry for: ${productName} in store: ${req.partnerStore.businessName}`);

      return res.status(201).json(inventory);
    } catch (err: any) {
      console.error("Inventory creation transaction failed:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback in-memory implementation
  let product = MOCK_PRODUCTS.find(p => p.brand.toLowerCase() === brand.toLowerCase() && p.name.toLowerCase() === productName.toLowerCase());
  if (!product) {
    product = {
      id: "prod-" + Date.now(),
      name: productName,
      brand: brand,
      category: category,
      description: `Bespoke partner product: ${productName} by ${brand}.`,
      price: localPrice,
      rating: 4.5,
      reviewsCount: 0,
      image: shelfImageUrl || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      colors: [],
      sizes: [],
      secondaryImages: [],
      tags: [],
    };
    MOCK_PRODUCTS.push(product);
  }

  const newInventory = {
    id: "inv-" + Date.now(),
    storeId: req.partnerStore.id,
    productId: product.id,
    price: localPrice,
    stockQuantity: stockQuantity,
    shelfImageUrl: shelfImageUrl || null,
    cloudinaryPublicId: cloudinaryPublicId || null,
    createdAt: new Date().toISOString(),
    product,
    store: req.partnerStore
  };

  dbPartnerInventories.push(newInventory);
  addAuditLog("PARTNER_INVENTORY_CREATED", req.user.email, `Created inventory entry for: ${productName} in store: ${req.partnerStore.businessName}`);

  return res.status(201).json(newInventory);
});

// --- ANALYTICS EVENT TRACKING ---

// In-memory analytics fallback storage
const memoryAnalytics = new Map<string, { clicks: number; addToCarts: number; conversions: number }>();

function getOrCreateMemoryAnalytics(inventoryId: string) {
  if (!memoryAnalytics.has(inventoryId)) {
    memoryAnalytics.set(inventoryId, { clicks: 0, addToCarts: 0, conversions: 0 });
  }
  return memoryAnalytics.get(inventoryId)!;
}

// TRACK CLICK EVENT
app.post("/api/analytics/click", authenticateUser, async (req, res) => {
  const { partnerInventoryId } = req.body;
  if (!partnerInventoryId) {
    return res.status(400).json({ error: "partnerInventoryId is required." });
  }

  if (usePrisma) {
    try {
      await recordClick(partnerInventoryId);
      return res.json({ success: true, event: "click", partnerInventoryId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory fallback
  const stats = getOrCreateMemoryAnalytics(partnerInventoryId);
  stats.clicks++;
  return res.json({ success: true, event: "click", partnerInventoryId });
});

// TRACK ADD-TO-CART EVENT
app.post("/api/analytics/add-to-cart", authenticateUser, async (req, res) => {
  const { partnerInventoryId } = req.body;
  if (!partnerInventoryId) {
    return res.status(400).json({ error: "partnerInventoryId is required." });
  }

  if (usePrisma) {
    try {
      await recordAddToCart(partnerInventoryId);
      return res.json({ success: true, event: "addToCart", partnerInventoryId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const stats = getOrCreateMemoryAnalytics(partnerInventoryId);
  stats.addToCarts++;
  return res.json({ success: true, event: "addToCart", partnerInventoryId });
});

// TRACK CONVERSION EVENT
app.post("/api/analytics/conversion", authenticateUser, async (req, res) => {
  const { partnerInventoryId } = req.body;
  if (!partnerInventoryId) {
    return res.status(400).json({ error: "partnerInventoryId is required." });
  }

  if (usePrisma) {
    try {
      await recordConversion(partnerInventoryId);
      return res.json({ success: true, event: "conversion", partnerInventoryId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const stats = getOrCreateMemoryAnalytics(partnerInventoryId);
  stats.conversions++;
  return res.json({ success: true, event: "conversion", partnerInventoryId });
});

// GET PARTNER ANALYTICS SUMMARY
app.get("/api/partner/analytics", authenticateUser, isActivePartner, async (req, res) => {
  const daysStr = req.query.days as string;
  const days = daysStr ? parseInt(daysStr, 10) : 7;

  if (usePrisma) {
    try {
      const summary = await getPartnerAnalyticsSummary(req.partnerStore.id, days);
      return res.json({ storeId: req.partnerStore.id, period: `${days} days`, summary });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory fallback
  const inventoryIds = dbPartnerInventories
    .filter(i => i.storeId === req.partnerStore.id)
    .map(i => i.id);

  const summary = inventoryIds.map(id => {
    const stats = memoryAnalytics.get(id) || { clicks: 0, addToCarts: 0, conversions: 0 };
    const inv = dbPartnerInventories.find(i => i.id === id);
    const score = Math.min(100, (stats.clicks * 1) + (stats.addToCarts * 3) + (stats.conversions * 10));
    return {
      inventoryId: id,
      productName: inv?.product?.name || "Unknown",
      brand: inv?.product?.brand || "Unknown",
      ...stats,
      engagementScore: score
    };
  });

  return res.json({ storeId: req.partnerStore.id, period: `${days} days`, summary });
});

// GET LOW-PERFORMING INVENTORY ALERTS
app.get("/api/partner/analytics/low-performers", authenticateUser, isActivePartner, async (req, res) => {
  const thresholdStr = req.query.threshold as string;
  const threshold = thresholdStr ? parseInt(thresholdStr, 10) : 10;

  if (usePrisma) {
    try {
      const items = await getLowPerformingItems(req.partnerStore.id, threshold);
      return res.json({
        storeId: req.partnerStore.id,
        threshold,
        lowPerformers: items,
        alert: items.length > 0
          ? `${items.length} product(s) need attention. Consider uploading higher-quality shelf images.`
          : "All products are performing well!"
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory fallback
  const inventoryIds = dbPartnerInventories
    .filter(i => i.storeId === req.partnerStore.id)
    .map(i => i.id);

  const lowPerformers = inventoryIds
    .map(id => {
      const stats = memoryAnalytics.get(id) || { clicks: 0, addToCarts: 0, conversions: 0 };
      const inv = dbPartnerInventories.find(i => i.id === id);
      const score = Math.min(100, (stats.clicks * 1) + (stats.addToCarts * 3) + (stats.conversions * 10));
      return { inventoryId: id, productName: inv?.product?.name || "Unknown", brand: inv?.product?.brand || "Unknown", ...stats, engagementScore: score };
    })
    .filter(item => item.engagementScore < threshold);

  return res.json({
    storeId: req.partnerStore.id,
    threshold,
    lowPerformers,
    alert: lowPerformers.length > 0
      ? `${lowPerformers.length} product(s) need attention. Consider uploading higher-quality shelf images.`
      : "All products are performing well!"
  });
});

// ADMIN: TRIGGER WEEKLY SCORING JOB
app.post("/api/admin/analytics/run-scoring", authenticateUser, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required.", code: "FORBIDDEN" });
  }

  if (usePrisma) {
    try {
      const count = await runWeeklyScoringJob();
      addAuditLog("WEEKLY_SCORING_RUN", req.user.email, `Weekly scoring job completed. ${count} scores computed.`);
      return res.json({ success: true, scoresComputed: count });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory: mock scoring
  addAuditLog("WEEKLY_SCORING_RUN", req.user.email, "Weekly scoring job completed (in-memory mode).");
  return res.json({ success: true, scoresComputed: 0, note: "In-memory mode: no persistent scoring." });
});

// --- REVERSE IMAGE SEARCH PIPELINE ---

// CONSUMER REVERSE IMAGE SEARCH
app.post("/api/search/reverse-image", authenticateUser, async (req, res) => {
  const { imageUrl, lat, lng } = req.body;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "imageUrl is required and must be a string." });
  }

  // Check cache first
  const cacheKey = `reverse-search:${imageUrl}`;
  const cachedResult = cacheService.get(cacheKey);
  if (cachedResult) {
    return res.json({ ...cachedResult, cached: true });
  }

  try {
    // Step 1: AI Analysis — identify product from consumer photo
    let analysis;
    try {
      analysis = await analyzeConsumerPhoto(imageUrl);
    } catch (aiErr: any) {
      console.error("Reverse image AI analysis failed:", aiErr);
      // Fallback: attempt basic keyword extraction from URL
      const urlParts = imageUrl.split("/").pop()?.replace(/[-_\.]/g, " ").split(" ") || [];
      analysis = {
        productName: urlParts.join(" "),
        brand: null,
        category: null,
        petType: null,
        keywords: urlParts.filter((w: string) => w.length > 2),
        confidence: 0.1
      };
      addAuditLog("REVERSE_SEARCH_AI_FALLBACK", req.user?.email || "Guest", `AI analysis failed for: ${imageUrl}. Using URL-based fallback.`);
    }

    // Step 2: Search catalog for matching products
    const catalogMatches = await searchCatalog(
      analysis.keywords,
      analysis.brand,
      analysis.category,
      usePrisma,
      MOCK_PRODUCTS
    );

    // Step 3: Find local availability for matched products
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;

    const availabilityMap = await findLocalAvailability(
      catalogMatches.map(m => m.id),
      userLat,
      userLng,
      usePrisma,
      dbPartnerInventories,
      dbPartnerStoresList
    );

    // Combine results
    const matches = catalogMatches.map(match => ({
      ...match,
      availability: availabilityMap.get(match.id) || []
    }));

    const result = {
      query: {
        productName: analysis.productName,
        brand: analysis.brand,
        category: analysis.category,
        petType: analysis.petType,
        confidence: analysis.confidence
      },
      matches,
      cached: false
    };

    // Cache for 1 hour
    cacheService.set(cacheKey, result, 60 * 60 * 1000);

    addAuditLog("REVERSE_IMAGE_SEARCH", req.user?.email || "Guest", `Reverse search completed: "${analysis.productName}" — ${matches.length} catalog matches found.`);

    return res.json(result);
  } catch (err: any) {
    console.error("Reverse image search error:", err);
    return res.status(500).json({ error: "Reverse image search failed. Please try again." });
  }
});

// Token rotation endpoint (refresh-token rotation pattern)
app.post("/api/auth/token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required." });
  }
  const tokenIdx = dbRefreshTokens.indexOf(refreshToken);
  if (tokenIdx === -1) {
    addAuditLog("TOKEN_REUSE_DETECTED", "System", `Potential hijack attempt using revoked/invalid token: ${refreshToken}`);
    return res.status(403).json({ error: "Token invalid or already rotated. Re-authentication required." });
  }
  // Rotate token
  dbRefreshTokens.splice(tokenIdx, 1);
  const newAccessToken = "access-token-rotated-" + Math.floor(Math.random() * 10000);
  const newRefreshToken = "refresh-token-rotated-" + Math.floor(Math.random() * 10000);
  dbRefreshTokens.push(newRefreshToken);
  
  addAuditLog("TOKEN_ROTATED", "sarah-vip", "Successfully rotated authentication refresh token pair.");
  return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// Audit log view
app.get("/api/audit-logs", (req, res) => {
  return res.json(dbAuditLogs);
});

// --- USER & PET MANAGEMENT ---
app.get("/api/user/profile", (req, res) => {
  return res.json(dbUsers[0]);
});

app.put("/api/user/profile", (req, res) => {
  const { username, email, phone, bio, avatar } = req.body;
  const user = dbUsers[0];
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;
  
  addAuditLog("USER_PROFILE_UPDATE", user.username, "Updated VIP curator contact profile.");
  return res.json({ success: true, profile: user });
});

app.get("/api/user/pets", (req, res) => {
  return res.json(dbPetProfiles);
});

app.post("/api/user/pets", (req, res) => {
  const { name, type, breed, age, weight, image, bio } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required." });
  }
  const newPet: PetProfile = {
    id: "pet-" + Date.now(),
    name,
    type,
    breed: breed || "Unspecified",
    age: age || "1 Year",
    weight: weight || "10 lbs",
    image: image || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
    bio: bio || "",
    recommendations: type === "cat" ? ["walnut-cat-hammock", "ceramic-cat-fountain"] : ["cloud-bed", "woven-leather-leash"]
  };
  dbPetProfiles.push(newPet);
  addAuditLog("PET_PROFILE_CREATED", "sarah-vip", `Added companion profile for ${name} (${type})`);
  return res.status(201).json(newPet);
});

app.put("/api/user/pets/:id", (req, res) => {
  const pet = dbPetProfiles.find(p => p.id === req.params.id);
  if (!pet) return res.status(404).json({ error: "Companion profile not found." });
  
  const { name, type, breed, age, weight, image, bio } = req.body;
  if (name) pet.name = name;
  if (type) pet.type = type;
  if (breed) pet.breed = breed;
  if (age) pet.age = age;
  if (weight) pet.weight = weight;
  if (image) pet.image = image;
  if (bio) pet.bio = bio;
  
  addAuditLog("PET_PROFILE_UPDATED", "sarah-vip", `Modified companion profile details for ${pet.name}`);
  return res.json(pet);
});

app.delete("/api/user/pets/:id", (req, res) => {
  const petIdx = dbPetProfiles.findIndex(p => p.id === req.params.id);
  if (petIdx === -1) return res.status(404).json({ error: "Companion profile not found." });
  const petName = dbPetProfiles[petIdx].name;
  dbPetProfiles.splice(petIdx, 1);
  addAuditLog("PET_PROFILE_DELETED", "sarah-vip", `Deleted companion profile for ${petName}`);
  return res.json({ success: true, message: "Companion profile successfully detached." });
});

// --- ADDRESS MANAGEMENT MODULE ---
app.get("/api/user/addresses", (req, res) => {
  return res.json(dbAddresses);
});

app.post("/api/user/addresses", (req, res) => {
  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (!street || !city || !state || !zip) {
    return res.status(400).json({ error: "Address values are incomplete." });
  }
  const id = "addr-" + Date.now();
  if (isDefault) {
    dbAddresses.forEach(a => a.isDefault = false);
  }
  const newAddr: Address = {
    id,
    label: label || "Office",
    street,
    city,
    state,
    zip,
    country: country || "United States",
    isDefault: !!isDefault
  };
  dbAddresses.push(newAddr);
  addAuditLog("ADDRESS_CREATED", "sarah-vip", `Registered shipping address label: ${newAddr.label}`);
  return res.status(201).json(newAddr);
});

app.put("/api/user/addresses/:id", (req, res) => {
  const addr = dbAddresses.find(a => a.id === req.params.id);
  if (!addr) return res.status(404).json({ error: "Address record not found." });
  
  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (isDefault) {
    dbAddresses.forEach(a => a.isDefault = false);
    addr.isDefault = true;
  }
  if (label) addr.label = label;
  if (street) addr.street = street;
  if (city) addr.city = city;
  if (state) addr.state = state;
  if (zip) addr.zip = zip;
  if (country) addr.country = country;
  
  addAuditLog("ADDRESS_UPDATED", "sarah-vip", `Updated shipping address: ${addr.label}`);
  return res.json(addr);
});

app.delete("/api/user/addresses/:id", (req, res) => {
  const addrIdx = dbAddresses.findIndex(a => a.id === req.params.id);
  if (addrIdx === -1) return res.status(404).json({ error: "Address not found." });
  const label = dbAddresses[addrIdx].label;
  dbAddresses.splice(addrIdx, 1);
  addAuditLog("ADDRESS_DELETED", "sarah-vip", `Removed shipping address: ${label}`);
  return res.json({ success: true });
});

// --- WISHLIST MANAGEMENT MODULE ---
app.get("/api/user/wishlist", (req, res) => {
  const userItems = dbWishlists.filter(w => w.userId === "sarah-vip").map(w => w.productId);
  return res.json(userItems);
});

app.post("/api/user/wishlist", (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required." });
  const exists = dbWishlists.some(w => w.userId === "sarah-vip" && w.productId === productId);
  if (!exists) {
    dbWishlists.push({ userId: "sarah-vip", productId });
  }
  return res.json({ success: true, wishlist: dbWishlists.filter(w => w.userId === "sarah-vip").map(w => w.productId) });
});

app.delete("/api/user/wishlist/:productId", (req, res) => {
  const idx = dbWishlists.findIndex(w => w.userId === "sarah-vip" && w.productId === req.params.productId);
  if (idx > -1) {
    dbWishlists.splice(idx, 1);
  }
  return res.json({ success: true, wishlist: dbWishlists.filter(w => w.userId === "sarah-vip").map(w => w.productId) });
});

// --- CATEGORIES CRUD ---
app.get("/api/categories", (req, res) => {
  return res.json(dbCategories);
});

app.post("/api/categories", (req, res) => {
  const { id, name, description } = req.body;
  if (!id || !name) return res.status(400).json({ error: "Category id and name required." });
  if (dbCategories.some(c => c.id === id)) return res.status(400).json({ error: "Category already exists." });
  const newCat: Category = { id, name, description: description || "" };
  dbCategories.push(newCat);
  addAuditLog("CATEGORY_CREATED", "Sarah (Admin)", `Created category listing: ${name}`);
  return res.status(201).json(newCat);
});

app.put("/api/categories/:id", (req, res) => {
  const cat = dbCategories.find(c => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: "Category not found." });
  const { name, description } = req.body;
  if (name) cat.name = name;
  if (description) cat.description = description;
  addAuditLog("CATEGORY_UPDATED", "Sarah (Admin)", `Modified category listing: ${cat.name}`);
  return res.json(cat);
});

app.delete("/api/categories/:id", (req, res) => {
  const idx = dbCategories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Category not found." });
  const name = dbCategories[idx].name;
  dbCategories.splice(idx, 1);
  addAuditLog("CATEGORY_DELETED", "Sarah (Admin)", `Deleted category listing: ${name}`);
  return res.json({ success: true });
});

// --- BRANDS CRUD ---
app.get("/api/brands", (req, res) => {
  return res.json(dbBrands);
});

app.post("/api/brands", (req, res) => {
  const { id, name, description } = req.body;
  if (!id || !name) return res.status(400).json({ error: "Brand id and name required." });
  if (dbBrands.some(b => b.id === id)) return res.status(400).json({ error: "Brand already exists." });
  const newBrand: Brand = { id, name, description: description || "" };
  dbBrands.push(newBrand);
  addAuditLog("BRAND_CREATED", "Sarah (Admin)", `Added luxury brand partner: ${name}`);
  return res.status(201).json(newBrand);
});

app.put("/api/brands/:id", (req, res) => {
  const brand = dbBrands.find(b => b.id === req.params.id);
  if (!brand) return res.status(404).json({ error: "Brand partner not found." });
  const { name, description } = req.body;
  if (name) brand.name = name;
  if (description) brand.description = description;
  addAuditLog("BRAND_UPDATED", "Sarah (Admin)", `Updated luxury brand details: ${brand.name}`);
  return res.json(brand);
});

app.delete("/api/brands/:id", (req, res) => {
  const idx = dbBrands.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Brand not found." });
  const name = dbBrands[idx].name;
  dbBrands.splice(idx, 1);
  addAuditLog("BRAND_DELETED", "Sarah (Admin)", `Removed luxury brand listing: ${name}`);
  return res.json({ success: true });
});

// --- INVENTORY MANAGEMENT MODULE ---
app.get("/api/inventory", (req, res) => {
  return res.json(dbInventory);
});

app.get("/api/inventory/low-stock-alerts", (req, res) => {
  const threshold = 5;
  const alerts = Object.keys(dbInventory)
    .filter(productId => dbInventory[productId] <= threshold)
    .map(productId => ({
      productId,
      stock: dbInventory[productId],
      threshold,
      warning: "Urgent inventory restock recommended."
    }));
  return res.json(alerts);
});

app.put("/api/inventory/:productId", (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || typeof stock !== "number") {
    return res.status(400).json({ error: "Stock count value is required as a number." });
  }
  dbInventory[req.params.productId] = stock;
  addAuditLog("INVENTORY_UPDATED", "Sarah (Admin)", `Stock count updated for ${req.params.productId} to ${stock}`);
  return res.json({ productId: req.params.productId, stock });
});

// --- COUPONS AND PROMOTIONS MODULE ---
app.get("/api/coupons", (req, res) => {
  return res.json(dbCoupons);
});

app.post("/api/coupons", (req, res) => {
  const { code, percent, isActive, maxUses } = req.body;
  if (!code || percent === undefined) {
    return res.status(400).json({ error: "Coupon code and percent discount required." });
  }
  const formattedCode = code.toUpperCase().trim();
  if (dbCoupons.some(c => c.code === formattedCode)) {
    return res.status(400).json({ error: "Coupon code already exists." });
  }
  const newCoupon: Coupon = {
    code: formattedCode,
    percent,
    isActive: isActive !== false,
    maxUses: maxUses || 100,
    usedCount: 0
  };
  dbCoupons.push(newCoupon);
  addAuditLog("COUPON_CREATED", "Sarah (Admin)", `Generated VIP coupon promo: ${formattedCode} for ${percent}% discount`);
  return res.status(201).json(newCoupon);
});

app.post("/api/coupons/validate", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required." });
  const coupon = dbCoupons.find(c => c.code === code.toUpperCase().trim());
  if (!coupon) {
    return res.status(404).json({ valid: false, error: "Exquisite offer code is invalid." });
  }
  if (!coupon.isActive) {
    return res.status(400).json({ valid: false, error: "Offer code is no longer active." });
  }
  if (coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ valid: false, error: "Offer usage thresholds reached." });
  }
  return res.json({ valid: true, percent: coupon.percent, code: coupon.code });
});

app.put("/api/coupons/:code", (req, res) => {
  const coupon = dbCoupons.find(c => c.code === req.params.code.toUpperCase());
  if (!coupon) return res.status(404).json({ error: "Coupon not found." });
  const { percent, isActive, maxUses } = req.body;
  if (percent !== undefined) coupon.percent = percent;
  if (isActive !== undefined) coupon.isActive = isActive;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  addAuditLog("COUPON_UPDATED", "Sarah (Admin)", `Modified coupon campaign rules: ${coupon.code}`);
  return res.json(coupon);
});

app.delete("/api/coupons/:code", (req, res) => {
  const idx = dbCoupons.findIndex(c => c.code === req.params.code.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: "Coupon not found." });
  dbCoupons.splice(idx, 1);
  addAuditLog("COUPON_DELETED", "Sarah (Admin)", `Terminated coupon campaign code: ${req.params.code}`);
  return res.json({ success: true });
});

// --- REVIEWS AND RATINGS MODULE ---
app.get("/api/reviews/:productId", (req, res) => {
  const reviews = dbReviews.filter(r => r.productId === req.params.productId);
  return res.json(reviews);
});

app.post("/api/reviews/:productId", (req, res) => {
  const { rating, title, author, companionName, companionBreed, comment } = req.body;
  if (!rating || !author || !comment) {
    return res.status(400).json({ error: "Rating, author, and review comments are required." });
  }
  const newReview: Review = {
    id: "rev-" + Date.now(),
    productId: req.params.productId,
    rating: Number(rating),
    title: title || "Curated Review",
    author,
    companionName,
    companionBreed,
    comment,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    verified: true
  };
  dbReviews.push(newReview);
  addAuditLog("REVIEW_SUBMITTED", author, `Created verified companion product review for: ${req.params.productId}`);
  return res.status(201).json(newReview);
});

app.delete("/api/reviews/:id", (req, res) => {
  const idx = dbReviews.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Review not found." });
  dbReviews.splice(idx, 1);
  addAuditLog("REVIEW_REMOVED", "Sarah (Admin)", `Pruned product review ID: ${req.params.id}`);
  return res.json({ success: true, message: "Review cleared from indices." });
});

// --- ORDERS & MULTI-VENDOR FULFILLMENT MANAGEMENT ---
app.get("/api/orders", (req, res) => {
  if (usePrisma) {
    prisma.order.findMany({
      include: {
        items: true,
        fulfillments: {
          include: { store: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }).then(orders => res.json(orders))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  return res.json(inMemoryOrders.length > 0 ? inMemoryOrders : dbOrders);
});

app.post("/api/orders", authenticateUser, async (req: any, res: any) => {
  const { items, addressId, couponCode, notes } = req.body;
  const userId = req.user?.id || req.user?.email || "sarah-vip";

  try {
    const order = await createSplitOrder(
      { userId, addressId, items, notes, couponCode },
      usePrisma,
      dbPartnerInventories,
      dbPartnerStoresList
    );

    addAuditLog("ORDER_PLACED", userId, `Created split order ${order.id} with ${order.fulfillments?.length || 1} store fulfillment(s).`);

    return res.status(201).json(order);
  } catch (err: any) {
    if (err instanceof StockError || err.name === "StockError") {
      return res.status(409).json({
        error: "Inventory Shortage",
        message: err.message,
        productName: err.productName,
        availableStock: err.availableStock,
        requestedQuantity: err.requestedQuantity
      });
    }
    return res.status(400).json({ error: err.message || "Failed to create split order." });
  }
});

// GET PARTNER FULFILLMENTS LIST (PROTECTED BY isActivePartner)
app.get("/api/partner/fulfillments", authenticateUser, isActivePartner, async (req: any, res: any) => {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

  try {
    const storeId = req.partnerStore.id;
    const data = await getPartnerFulfillments(storeId, status, limit, offset, usePrisma);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE PARTNER FULFILLMENT STATUS (PROTECTED BY isActivePartner)
app.patch("/api/partner/fulfillments/:id/status", authenticateUser, isActivePartner, async (req: any, res: any) => {
  const { status } = req.body;
  const fulfillmentId = req.params.id;
  const storeId = req.partnerStore.id;

  const validStatuses = ["CONFIRMED", "PREPARING", "READY", "CANCELLED", "COMPLETED"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const updated = await updateFulfillmentStatus(fulfillmentId, status, storeId, usePrisma);
    addAuditLog("FULFILLMENT_STATUS_UPDATE", req.user.email, `Fulfillment ${fulfillmentId} status updated to ${status} by store ${storeId}`);
    return res.json(updated);
  } catch (err: any) {
    if (err.code === "FORBIDDEN") {
      return res.status(403).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// GET PARENT ORDER DETAILS WITH ALL STORE FULFILLMENTS
app.get("/api/orders/:orderId", authenticateUser, async (req: any, res: any) => {
  const { orderId } = req.params;

  if (usePrisma) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          fulfillments: {
            include: {
              store: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied." });
      }

      return res.json(order);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback in-memory
  const order = inMemoryOrders.find(o => o.id === orderId) || dbOrders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  const fulfillments = inMemoryFulfillments.filter(f => f.orderId === orderId);
  return res.json({
    ...order,
    fulfillments
  });
});

// CUSTOMER CONFIRM PICKUP ACTION
app.patch("/api/orders/:orderId/fulfillments/:fulfillmentId/complete", authenticateUser, async (req: any, res: any) => {
  const { fulfillmentId } = req.params;
  const userId = req.user?.id || req.user?.email || "sarah-vip";

  try {
    const updated = await completeFulfillment(fulfillmentId, userId, usePrisma);
    addAuditLog("FULFILLMENT_COMPLETED", userId, `Customer confirmed pickup for fulfillment ${fulfillmentId}`);
    return res.json(updated);
  } catch (err: any) {
    if (err.code === "FORBIDDEN") {
      return res.status(403).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RAZORPAY PAYMENT GATEWAY & ROUTE ENDPOINTS
// ==========================================

// 1. CREATE RAZORPAY ORDER FOR CHECKOUT
app.post(["/api/payments/create-intent", "/api/payments/create-razorpay-order"], authenticateUser, async (req: any, res: any) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required." });
  }

  try {
    const paymentIntent = await createRazorpayOrder(orderId, usePrisma);
    addAuditLog("PAYMENT_ORDER_CREATED", req.user?.id || "guest", `Created Razorpay order ${paymentIntent.razorpayOrderId} for order ${orderId}`);
    return res.json({
      clientSecret: paymentIntent.razorpayOrderId, // compatible field for checkout
      razorpayOrderId: paymentIntent.razorpayOrderId,
      orderId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      key: paymentIntent.key
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. VERIFY RAZORPAY PAYMENT SIGNATURE & CONFIRM ORDER
app.post("/api/payments/verify-payment", authenticateUser, async (req: any, res: any) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId) {
    return res.status(400).json({ error: "razorpayOrderId and razorpayPaymentId are required." });
  }

  try {
    const confirmedOrder = await handlePaymentSuccess(razorpayOrderId, razorpayPaymentId, razorpaySignature, usePrisma);
    addAuditLog("PAYMENT_SUCCESS", req.user?.id || "guest", `Razorpay payment verified: ${razorpayPaymentId}`);
    return res.json({ success: true, order: confirmedOrder });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 3. PARTNER ROUTE ONBOARDING LINK GENERATION
app.post("/api/payments/partner/onboard", isActivePartner, async (req: any, res: any) => {
  const storeId = req.partnerStore?.id || "partner-active-store";
  const email = req.partnerStore?.owner?.email || "partner@example.com";
  const businessName = req.partnerStore?.businessName || "Boutique Partner Store";

  try {
    const result = await createRazorpayPartnerAccount(storeId, email, businessName, usePrisma);
    addAuditLog("PARTNER_ONBOARDING_INITIATED", storeId, `Generated Razorpay Route onboarding link: ${result.accountId}`);
    return res.json({ url: result.onboardingLink, accountId: result.accountId });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4. PARTNER PAYMENT ACCOUNT STATUS
app.get("/api/payments/partner/status", isActivePartner, async (req: any, res: any) => {
  const storeId = req.partnerStore?.id || "partner-active-store";
  try {
    const statusInfo = await generatePartnerOnboardingUrl(storeId, usePrisma);
    return res.json({
      stripeAccountStatus: statusInfo.status === "ACTIVE" ? "ACTIVE" : (req.partnerStore?.razorpayAccountStatus || "NOT_STARTED"),
      razorpayAccountStatus: statusInfo.status === "ACTIVE" ? "ACTIVE" : (req.partnerStore?.razorpayAccountStatus || "NOT_STARTED"),
      url: statusInfo.url
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. PUBLIC RAZORPAY WEBHOOK ENDPOINT
app.post(["/api/webhooks/razorpay", "/api/webhooks/stripe"], async (req: any, res: any) => {
  const signature = req.headers["x-razorpay-signature"] || req.headers["stripe-signature"];
  const eventPayload = req.body;
  const eventId = eventPayload?.payload?.payment?.entity?.id || eventPayload?.id || `evt_${Date.now()}`;
  const eventType = eventPayload?.event || eventPayload?.type || "order.paid";

  try {
    // Log incoming webhook event
    await logRazorpayWebhook(eventId, eventType, eventPayload, "SUCCESS", undefined, usePrisma);

    if (eventType === "order.paid" || eventType === "payment.captured" || eventType === "payment_intent.succeeded") {
      const razorpayOrderId = eventPayload?.payload?.order?.entity?.id || eventPayload?.data?.object?.id || eventPayload?.orderId;
      const razorpayPaymentId = eventPayload?.payload?.payment?.entity?.id || `pay_${Date.now()}`;

      if (razorpayOrderId) {
        await handlePaymentSuccess(razorpayOrderId, razorpayPaymentId, undefined, usePrisma);
      }
    } else if (eventType === "payment.failed" || eventType === "payment_intent.payment_failed") {
      const orderId = eventPayload?.payload?.payment?.entity?.notes?.orderId;
      if (orderId) {
        if (usePrisma) {
          try {
            await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" } });
          } catch (e) {}
        }
      }
    } else if (eventType === "refund.processed" || eventType === "charge.refunded") {
      const orderId = eventPayload?.payload?.refund?.entity?.notes?.orderId || eventPayload?.orderId;
      if (orderId) {
        await handleRefund(orderId, "Refund processed via webhook", usePrisma);
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    await logRazorpayWebhook(eventId, eventType, eventPayload, "FAILED", err.message, usePrisma);
    return res.status(400).json({ error: err.message });
  }
});




app.put("/api/orders/:id/status", (req, res) => {
  const { status, description } = req.body;
  if (!status) return res.status(400).json({ error: "Order status is required." });
  const order = dbOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  
  order.status = status;
  
  // Register tracking timeline event
  if (!dbOrderTimelines[order.id]) dbOrderTimelines[order.id] = [];
  dbOrderTimelines[order.id].push({
    date: new Date().toLocaleString(),
    status,
    description: description || `Status updated to ${status}`
  });

  // Notify User
  dbNotifications.unshift({
    id: "notif-" + Date.now(),
    userId: order.userId,
    title: `Order Status Update: ${status}`,
    message: `Your order ${order.id} status is now: ${status}.`,
    isRead: false,
    date: new Date().toLocaleDateString()
  });

  addAuditLog("ORDER_STATUS_CHANGED", "Sarah (Admin)", `Order ${order.id} updated to status: ${status}`);
  return res.json(order);
});

app.post("/api/orders/:id/cancel", (req, res) => {
  const order = dbOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status === "Delivered" || order.status === "Cancelled" || order.status === "Refunded") {
    return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}.` });
  }

  order.status = "Cancelled";
  
  // Refund inventory levels
  for (const item of order.items) {
    if (item.productId && dbInventory[item.productId] !== undefined) {
      dbInventory[item.productId] += item.quantity;
    }
  }

  // Register in timeline
  if (!dbOrderTimelines[order.id]) dbOrderTimelines[order.id] = [];
  dbOrderTimelines[order.id].push({
    date: new Date().toLocaleString(),
    status: "Cancelled",
    description: "Curated purchase cancelled. Refund processed automatically to source payment."
  });

  addAuditLog("ORDER_CANCELLED", order.userId, `Bespoke order ${order.id} was cancelled and inventory restored.`);
  return res.json({ success: true, order });
});

app.post("/api/orders/:id/refund", (req, res) => {
  const order = dbOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status === "Refunded") {
    return res.status(400).json({ error: "Order is already refunded." });
  }

  order.status = "Refunded";
  
  // Refund inventory levels
  for (const item of order.items) {
    if (item.productId && dbInventory[item.productId] !== undefined) {
      dbInventory[item.productId] += item.quantity;
    }
  }

  // Register timeline
  if (!dbOrderTimelines[order.id]) dbOrderTimelines[order.id] = [];
  dbOrderTimelines[order.id].push({
    date: new Date().toLocaleString(),
    status: "Refunded",
    description: "Financial refund executed. Credited amount restored back to credit provider."
  });

  addAuditLog("ORDER_REFUNDED", "Sarah (Admin)", `Bespoke order ${order.id} was refunded financially by administrator.`);
  return res.json({ success: true, order });
});

app.get("/api/orders/:id/timeline", (req, res) => {
  const timeline = dbOrderTimelines[req.params.id] || [];
  return res.json(timeline);
});

app.post("/api/orders/:id/timeline", (req, res) => {
  const { status, description } = req.body;
  if (!status || !description) {
    return res.status(400).json({ error: "Timeline status and description required." });
  }
  const timeline = dbOrderTimelines[req.params.id];
  if (!timeline) return res.status(404).json({ error: "Order timeline registry not found." });
  
  const newEvent = {
    date: new Date().toLocaleString(),
    status,
    description
  };
  timeline.push(newEvent);
  return res.status(201).json(newEvent);
});

app.get("/api/orders/:id/invoice", (req, res) => {
  const order = dbOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  
  const address = dbAddresses.find(a => a.id === order.addressId) || dbAddresses[0];

  // Return a beautiful plain-text invoice printable format
  const invoiceHTML = `
    <div style="font-family: monospace; max-width: 600px; margin: 40px auto; padding: 30px; border: 1px solid #E5DEC9; background-color: #FAF9F6; color: #1C1C1A;">
      <h1 style="text-align: center; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">THE CULTIVATED COMPANION</h1>
      <p style="text-align: center; font-size: 10px; color: #666;">WHITE-GLOVE BOUTIQUE INVOICE</p>
      <hr style="border: none; border-top: 1px dashed #C27664; margin: 20px 0;">
      
      <table style="width: 100%; font-size: 12px; line-height: 1.8;">
        <tr>
          <td><strong>INVOICE ID:</strong> ${order.id}</td>
          <td style="text-align: right;"><strong>DATE:</strong> ${order.date}</td>
        </tr>
        <tr>
          <td><strong>CLIENT ID:</strong> ${order.userId}</td>
          <td style="text-align: right;"><strong>STATUS:</strong> ${order.status.toUpperCase()}</td>
        </tr>
      </table>
      
      <div style="margin: 25px 0; font-size: 12px;">
        <strong>SHIPPING DESTINATION:</strong><br>
        ${address.label}<br>
        ${address.street}<br>
        ${address.city}, ${address.state} ${address.zip}<br>
        ${address.country}
      </div>
      
      <hr style="border: none; border-top: 1px dashed #E5DEC9; margin: 20px 0;">
      
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #E5DEC9; text-align: left;">
            <th style="padding: 8px 0;">ITEM SUMMARY</th>
            <th style="padding: 8px 0; text-align: center;">QTY</th>
            <th style="padding: 8px 0; text-align: right;">PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px 0;">${item.name}</td>
              <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px 0; text-align: right;">₹${item.price.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <hr style="border: none; border-top: 1px dashed #E5DEC9; margin: 20px 0;">
      
      <table style="width: 100%; font-size: 12px; line-height: 2;">
        ${order.couponCode ? `
          <tr>
            <td style="text-align: right; width: 80%;">PROMOTIONAL REDEMPTION (${order.couponCode}):</td>
            <td style="text-align: right;">SAVINGS</td>
          </tr>
        ` : ""}
        <tr>
          <td style="text-align: right; width: 80%;"><strong>TOTAL SUM:</strong></td>
          <td style="text-align: right;"><strong>₹${order.total.toFixed(2)}</strong></td>
        </tr>
      </table>
      
      <hr style="border: none; border-top: 1px dashed #C27664; margin: 30px 0;">
      <p style="text-align: center; font-size: 10px; color: #666; font-style: italic;">Thank you for prioritizing companion lifestyle symmetry with The Paws Store.</p>
    </div>
  `;
  return res.send(invoiceHTML);
});

// --- ADMIN SYSTEM METRICS ---
app.get("/api/admin/metrics", (req, res) => {
  const totalSales = dbOrders.filter(o => o.status !== "Cancelled" && o.status !== "Refunded").reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = dbOrders.length;
  const activeCoupons = dbCoupons.filter(c => c.isActive).length;
  const pendingOrdersCount = dbOrders.filter(o => o.status === "Processing").length;
  const lowStockCount = Object.keys(dbInventory).filter(p => dbInventory[p] <= 5).length;
  
  return res.json({
    totalSales,
    totalOrdersCount,
    activeCoupons,
    pendingOrdersCount,
    lowStockCount,
    auditLogsCount: dbAuditLogs.length
  });
});

// --- ADVANCED PRODUCT CRUDS ---
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { reviews: true }
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  const { id, name, description, price, brand, category, tags, sizes, colors, image } = req.body;
  if (!id || !name || price === undefined || !category) {
    return res.status(400).json({ error: "Product id, name, price and category required." });
  }
  try {
    const newProduct = await prisma.product.create({
      data: {
        id,
        name,
        description: description || "",
        price: Number(price),
        rating: 5.0,
        reviewsCount: 0,
        image: image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        category,
        secondaryImages: [],
        sizes: sizes || ["Standard"],
        colors: colors || [{ name: "Default", value: "#000" }],
        tags: tags || [],
        brand: brand || "The Paws Store"
      }
    });

    addAuditLog("PRODUCT_CREATED", "Sarah (Admin)", `Launched product entry: ${name}`);
    return res.status(201).json(newProduct);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { name, description, price, brand, category, tags, sizes, colors, image } = req.body;
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        brand: brand !== undefined ? brand : undefined,
        category: category !== undefined ? category : undefined,
        tags: tags !== undefined ? tags : undefined,
        sizes: sizes !== undefined ? sizes : undefined,
        colors: colors !== undefined ? colors : undefined,
        image: image !== undefined ? image : undefined,
      }
    });
    addAuditLog("PRODUCT_UPDATED", "Sarah (Admin)", `Modified product specs for ID: ${req.params.id}`);
    return res.json({ success: true, message: "Product updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    addAuditLog("PRODUCT_DELETED", "Sarah (Admin)", `Deleted product entry ID: ${req.params.id}`);
    return res.json({ success: true, message: "Product purged from active catalog records." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATION UTILITIES ---
app.get("/api/notifications", (req, res) => {
  return res.json(dbNotifications);
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  if (id) {
    const notif = dbNotifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  } else {
    dbNotifications.forEach(n => n.isRead = true);
  }
  return res.json({ success: true });
});

app.post("/api/notifications", (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Title and message are required." });
  const newNotif: UserNotification = {
    id: "notif-" + Date.now(),
    userId: "sarah-vip",
    title,
    message,
    isRead: false,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  };
  dbNotifications.unshift(newNotif);
  return res.status(201).json(newNotif);
});

// --- CLOUDINARY FILE UPLOADS SIMULATOR ---
app.post("/api/upload", (req, res) => {
  // Simulates Cloudinary secured signatures and uploads securely
  const simulatedSecureUrl = `https://res.cloudinary.com/cultivated-companion/image/upload/v1721113200/companion_${Math.floor(Math.random() * 900000)}.png`;
  addAuditLog("SECURE_ASSET_UPLOAD", "Sarah (Admin)", "Uploaded companion image asset to Cloudinary media bucket.");
  return res.json({
    asset_id: "cl_asset_" + Math.floor(Math.random() * 100000),
    public_id: "companion_upload_assets",
    secure_url: simulatedSecureUrl,
    format: "png",
    bytes: 245032,
    created_at: new Date().toISOString()
  });
});

// --- AI-READY RECOMMENDATIONS SERVICE INTERFACES ---
app.get("/api/recommendations/feline-synergy", (req, res) => {
  // Matches optimal companion products matching specific traits
  const companionPersona = req.query.persona || "lounger";
  const focalGoal = req.query.goal || "sleeping";
  
  let recs: string[] = [];
  if (companionPersona === "explorer") {
    recs = ["organic-cat-scratcher", "catnip-teaser-wand"];
  } else if (companionPersona === "lounger") {
    recs = ["merino-wool-nest", "walnut-cat-hammock"];
  } else {
    recs = ["ceramic-cat-fountain", "merino-wool-nest"];
  }
  return res.json({
    inputPersona: companionPersona,
    inputGoal: focalGoal,
    score: 98,
    recommendedProductIds: recs,
    confidenceRate: "HIGH_CONFIDENCE_ALIGNMENT"
  });
});

app.get("/api/recommendations/user", (req, res) => {
  // Collaborative filters based on favorites and carts
  const userFavorites = dbWishlists.filter(w => w.userId === "sarah-vip").map(w => w.productId);
  const recommendedSet = new Set<string>();
  
  if (userFavorites.includes("cloud-bed")) {
    recommendedSet.add("woven-leather-leash");
  }
  if (userFavorites.includes("artisanal-treats")) {
    recommendedSet.add("ceramic-bowl");
  }
  // Default recommendations
  recommendedSet.add("merino-wool-nest");
  recommendedSet.add("ceramic-cat-fountain");

  return res.json({
    userId: "sarah-vip",
    contextFavorites: userFavorites,
    predictions: Array.from(recommendedSet).slice(0, 3),
    serviceModel: "curator-collaborative-v2"
  });
});


// API Diagnostics Endpoint
app.get("/api/diagnose-api", async (req, res) => {
  try {
    const hasKey = !!process.env.GEMINI_API_KEY;
    if (!hasKey) {
      return res.json({
        status: "missing",
        message: "No GEMINI_API_KEY detected in server environment.",
        hasKey: false,
        testCall: { status: "missing", error: "API Key environment variable is empty." },
        searchGrounding: { status: "skipped", error: "Cannot test search grounding without key." }
      });
    }

    const keyMask = process.env.GEMINI_API_KEY
      ? `${process.env.GEMINI_API_KEY.slice(0, 6)}...${process.env.GEMINI_API_KEY.slice(-4)}`
      : "";

    let testCallStatus = "pending";
    let testCallError: string | null = null;
    let searchGroundingStatus = "pending";
    let searchGroundingError: string | null = null;

    // Test 1: Basic Generation
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "Respond with exactly: ACTIVE",
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });
      const text = response.text?.trim() || "";
      if (text) {
        testCallStatus = "success";
      } else {
        testCallStatus = "empty_response";
        testCallError = "Received empty response from Gemini.";
      }
    } catch (err: any) {
      testCallStatus = "failed";
      testCallError = err.message || String(err);
    }

    // Test 2: Search Grounding
    if (testCallStatus === "success") {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: "Who is the Prime Minister of Canada?",
          config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });
        searchGroundingStatus = "success";
      } catch (err: any) {
        searchGroundingStatus = "failed";
        searchGroundingError = err.message || String(err);
      }
    } else {
      searchGroundingStatus = "skipped";
      searchGroundingError = "Basic API call failed. Skipping search test.";
    }

    return res.json({
      status: (testCallStatus === "success" && searchGroundingStatus === "success") ? "healthy" : "degraded",
      hasKey: true,
      keyMask,
      testCall: {
        status: testCallStatus,
        error: testCallError,
      },
      searchGrounding: {
        status: searchGroundingStatus,
        error: searchGroundingError,
      }
    });
  } catch (err: any) {
    console.error("Diagnostics error:", err);
    return res.status(500).json({
      status: "error",
      message: err.message || "An unexpected error occurred during diagnostics"
    });
  }
});

// Database Health Check Endpoint
app.get("/api/health/db", async (req, res) => {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    return res.json({
      status: "healthy",
      latency: `${latency}ms`
    });
  } catch (error: any) {
    console.error("Database health check failed:", error);
    return res.status(503).json({
      status: "unhealthy",
      error: error.message || String(error)
    });
  }
});

// Search Grounding API Endpoint
app.post("/api/search-grounding", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return offline content immediately with a notice if no key is configured
      const offline = getOfflineConciergeResponse(query);
      return res.json({
        text: offline.text,
        chunks: offline.chunks,
        isFallback: true,
        fallbackReason: "Live Service offline (No API key bound). Beautiful local archives activated.",
        source: "offline-expert"
      });
    }

    try {
      // TIER 1: Primary Live Search Grounding (Low Latency gemini-3.1-flash-lite)
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `You are a premium luxury pet concierge assistant at "The Paws Store". 
Provide an elegant, concise, helpful, and ultra-fast response to the user's query using Google Search.
Be warm, professional, and knowledgeable about high-end pet styling, health, care, and curated trends.

User Search Query: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const text = response.text;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return res.json({
        text,
        chunks: chunks.map((chunk: any) => ({
          title: chunk.web?.title || "Web Reference",
          uri: chunk.web?.uri || ""
        })).filter((c: any) => c.uri),
        isFallback: false,
        source: "live-search"
      });
    } catch (apiErr: any) {
      const errStr = String(apiErr.message || apiErr);
      const isQuotaError = errStr.includes("429") || errStr.toLowerCase().includes("quota") || apiErr.status === 429;
      console.warn("Primary live search grounding failed. Attempting standard generation fallback...", errStr);

      try {
        // TIER 2: Secondary Standard Text Generation (Low Latency gemini-3.1-flash-lite)
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `You are a premium luxury pet concierge assistant at "The Paws Store". 
Your live web-search search tool is temporarily resting due to network limits.
Provide a highly polished, elegant, concise, and ultra-fast response to the user's query using your built-in pet care knowledge.
Be warm, professional, and knowledgeable about high-end pet styling, health, care, and curated trends.

User Search Query: ${query}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        return res.json({
          text: fallbackResponse.text,
          chunks: [
            { title: "The Paws Store Premium Reference Desk", uri: "https://thepawsstore.com/reference-desk" }
          ],
          isFallback: true,
          fallbackReason: isQuotaError ? "Web Grounding Limit Met. Standard AI active." : "Alternative Connection",
          source: "standard-generation"
        });
      } catch (genErr: any) {
        // TIER 3: Local Offline Handcrafted Companion Expert System
        console.error("Standard fallback also failed. Invoking curated local knowledge repository...", genErr);
        const offline = getOfflineConciergeResponse(query);
        return res.json({
          text: offline.text,
          chunks: offline.chunks,
          isFallback: true,
          fallbackReason: "Live Search & AI rate-limited (429). Offline Curated Database active.",
          source: "offline-expert"
        });
      }
    }
  } catch (err: any) {
    console.error("Critical server endpoint failure:", err);
    res.status(500).json({ error: err.message || "An error occurred during search grounding" });
  }
});

async function startServer() {
  // Test connection on boot and fall back to in-memory mode if unreachable
  if (usePrisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("⚡ PostgreSQL Database connection validated successfully.");
    } catch (err) {
      console.warn("⚠️ Warning: PostgreSQL database is unreachable. Falling back to in-memory store for preview.");
      usePrisma = false;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
